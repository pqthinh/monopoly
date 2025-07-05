// backend/gameLogic.js
const { boardData, characterCards, opportunityCards, destinyCards } = require('./gameData');

// Lớp quản lý trạng thái người chơi
class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.money = 2000000;
        this.position = 0;
        this.properties = []; // Mảng các ID của ô đất sở hữu
        this.character = null;
        this.isInJail = false;
        this.jailTurns = 0;
        this.getOutOfJailCards = 0;
        this.doublesCount = 0;
        this.isBankrupt = false;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    }
}

// Lớp quản lý chính của game
class Game {
    constructor(playerSockets) {
        // --- TRẠNG THÁI GAME (STATE) ---
        this.board = JSON.parse(JSON.stringify(boardData.map(sq => ({ ...sq, ownerId: null, ownerColor: null, buildings: 0, taxMultiplier: 1 }))));
        this.players = playerSockets.map(socket => new Player(socket.id, socket.playerName));
        this.opportunityDeck = this.shuffle([...opportunityCards]);
        this.destinyDeck = this.shuffle([...destinyCards]);
        this.currentPlayerIndex = 0;
        this.dice = [0, 0];
        this.currentPhase = 'management'; // 'management', 'decision', 'rent', 'jail', 'event', 'festival', 'teleport'
        this.message = "Đã đủ 4 Hào Kiệt! Trận chiến bắt đầu!";
        this.lastCardDrawn = null;

        this.assignCharacters();
        this.updateMessageForNewTurn();
    }

    shuffle = (array) => { /* ... giữ nguyên hàm shuffle ... */ return array; };
    assignCharacters = () => { /* ... giữ nguyên ... */ };

    // --- HÀM XỬ LÝ HÀNH ĐỘNG CHÍNH ---
    handleAction(playerId, action) {
        if (this.players[this.currentPlayerIndex].id !== playerId) return; // Không phải lượt của bạn

        switch(action.type) {
            case 'rollDice': this.rollDice(); break;
            case 'buyProperty': this.buyProperty(); break;
            case 'build': this.buildOnProperty(action.payload.squareId); break;
            case 'payBail': this.payBail(); break;
            case 'useJailCard': this.useJailCard(); break;
            case 'teleportTo': this.teleportPlayer(action.payload.squareId); break;
            case 'applyFestival': this.applyFestival(action.payload.squareId); break;
            case 'endTurn': this.endTurn(); break;
        }
    }

    // --- LOGIC CHI TIẾT CHO TỪNG HÀNH ĐỘNG ---

    rollDice() {
        if (this.currentPhase !== 'management' && this.currentPhase !== 'jail') return;
        
        this.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        const player = this.players[this.currentPlayerIndex];
        const isDouble = this.dice[0] === this.dice[1];

        if (player.isInJail) {
            this.handleJailRoll(player, isDouble);
            return;
        }

        player.doublesCount = isDouble ? player.doublesCount + 1 : 0;
        this.message = `${player.name} gieo được ${this.dice[0]} và ${this.dice[1]}` + (isDouble ? " (Đôi!)." : ".");

        if (player.doublesCount === 3) {
            this.message += "\nGieo 3 lần đôi liên tiếp! Đi thẳng vào tù.";
            this.goToJail(player);
            return;
        }
        
        // Di chuyển
        const oldPosition = player.position;
        player.position = (oldPosition + this.dice[0] + this.dice[1]) % this.board.length;
        if (player.position < oldPosition) {
            player.money += 200000;
            this.message += "\nĐi qua LẬP QUỐC, nhận 200,000 vàng.";
        }

        this.handleLanding();
    }
    
    handleLanding() {
        const player = this.players[this.currentPlayerIndex];
        const square = this.board[player.position];
        this.message += `\nDi chuyển đến ô ${square.name}.`;

        switch(square.type) {
            case 'property': case 'river':
                if (!square.ownerId) {
                    this.currentPhase = 'decision';
                    this.message += `\nBạn có muốn mua ${square.name} với giá ${square.price.toLocaleString()} không?`;
                } else if (square.ownerId !== player.id) {
                    this.currentPhase = 'rent';
                    const owner = this.players.find(p => p.id === square.ownerId);
                    const rent = this.calculateRent(square, owner);
                    player.money -= rent;
                    owner.money += rent;
                    this.message += `\nPhải trả ${rent.toLocaleString()} tiền thuê cho ${owner.name}.`;
                    this.checkForBankruptcy();
                }
                break;
            case 'tax':
                player.money -= square.taxAmount;
                this.message += `\nPhải nộp thuế ${square.taxAmount.toLocaleString()}.`;
                this.checkForBankruptcy();
                break;
            case 'event':
                this.drawEventCard();
                this.currentPhase = 'event';
                break;
            case 'teleport': // Ngựa Ô
                this.currentPhase = 'teleport';
                this.message += "\nBạn được chọn một ô bất kỳ để di chuyển đến.";
                break;
            case 'festival': // Lễ Hội
                this.currentPhase = 'festival';
                this.message += "\nChọn một vùng đất của bạn để tổ chức lễ hội và nhân đôi thuế.";
                break;
        }

        if (player.doublesCount === 0 && this.currentPhase === 'management') {
            this.endTurn();
        }
    }

    buyProperty() {
        if (this.currentPhase !== 'decision') return;
        const player = this.players[this.currentPlayerIndex];
        const square = this.board[player.position];
        if (square.price <= player.money) {
            player.money -= square.price;
            player.properties.push(square.id);
            square.ownerId = player.id;
            square.ownerColor = player.color;
            this.message = `${player.name} đã mua ${square.name}.`;
        }
        if (player.doublesCount > 0) this.currentPhase = 'management';
        else this.endTurn();
    }

    buildOnProperty(squareId) {
        const player = this.players[this.currentPlayerIndex];
        const square = this.board.find(sq => sq.id === squareId);
        if (!square || square.ownerId !== player.id || player.money < square.buildCost || square.buildings >= 4) return;
        
        player.money -= square.buildCost;
        square.buildings++;
        this.message = `${player.name} đã xây 1 công trình trên ${square.name}.`;

        if (square.buildings === 3) {
            this.message += `\nCông trình trên ${square.name} đã được nâng cấp!`;
            // Thêm logic nâng cấp ở đây
        }
    }
    
    drawEventCard() {
        // Giả sử cứ 2 lần thì ra 1 thẻ Vận mệnh
        const deck = Math.random() < 0.5 ? this.opportunityDeck : this.destinyDeck;
        const card = deck.shift();
        deck.push(card); // Đặt lại thẻ xuống cuối bộ bài
        
        this.lastCardDrawn = card;
        this.message += `\nRút thẻ: "${card.text}"`;
        this.applyCardEffect(card);
    }
    
    applyCardEffect(card) {
        const player = this.players[this.currentPlayerIndex];
        switch(card.action) {
            case 'add_money': player.money += card.value; break;
            case 'remove_money': player.money -= card.value; this.checkForBankruptcy(); break;
            case 'get_out_of_jail_free': player.getOutOfJailCards++; break;
            case 'go_to_jail': this.goToJail(player); break;
            case 'move_to': player.position = card.value; this.handleLanding(); break;
            // ... thêm các hiệu ứng khác
        }
    }
    
    // --- CÁC HÀM PHỤ VÀ QUẢN LÝ ---
    
    goToJail(player) {
        player.position = 9; // Vị trí ô tù
        player.isInJail = true;
        player.jailTurns = 0;
        player.doublesCount = 0; // Reset double
        this.endTurn();
    }
    
    handleJailRoll(player, isDouble) {
        this.message = `${player.name} ở trong tù và gieo được ${this.dice[0]}-${this.dice[1]}.`;
        if (isDouble) {
            player.isInJail = false;
            player.jailTurns = 0;
            this.message += " Thật may mắn! Gieo được đôi, bạn đã được tự do!";
            this.currentPhase = 'management';
        } else {
            player.jailTurns++;
            if (player.jailTurns >= 3) {
                this.message += " Đã ở tù 3 lượt. Bạn phải trả tiền bảo lãnh trong lượt tới.";
                this.endTurn();
            } else {
                this.message += " Vẫn chưa ra được. Chờ lượt sau.";
                this.endTurn();
            }
        }
    }
    
    // ... thêm các hàm payBail, useJailCard, teleportPlayer, applyFestival
    
    checkForBankruptcy() {
        const player = this.players[this.currentPlayerIndex];
        if (player.money < 0) {
            player.isBankrupt = true;
            this.message += `\n${player.name} đã phá sản!`;
            // Logic chuyển tài sản...
        }
    }

    calculateRent(square, owner) {
        // Logic tính tiền độc quyền
        const ownedInGroup = this.board.filter(s => s.colorGroup === square.colorGroup && s.ownerId === owner.id);
        const isMonopoly = ownedInGroup.length === this.board.filter(s => s.colorGroup === square.colorGroup).length;
        console.log("calculateRent", square)
        console.log("owner", owner)
        let rent = square.rent[square.buildings];
        if (isMonopoly && square.buildings === 0) {
            rent *= 2;
        }
        rent *= square.taxMultiplier; // Áp dụng Lễ hội
        return rent;
    }
    
    endTurn() {
        const player = this.players[this.currentPlayerIndex];
        // Nếu không gieo được đôi, hoặc đang trong các phase không được gieo lại
        if (player.doublesCount === 0 || !['management', 'decision'].includes(this.currentPhase)) {
            player.doublesCount = 0;
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.updateMessageForNewTurn();
        }
        this.currentPhase = 'management';
    }
    
    updateMessageForNewTurn() {
        const nextPlayer = this.players[this.currentPlayerIndex];
        this.message = `Đến lượt của ${nextPlayer.name}.`;
    }
    
    getGameState() {
        return {
            board: this.board,
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            dice: this.dice,
            currentPhase: this.currentPhase,
            message: this.message,
        };
    }
}

module.exports = Game;