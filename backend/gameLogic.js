const { boardData, characterCards, opportunityCards, destinyCards } = require('./gameData');

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.money = 2000000;
        this.position = 0;
        this.properties = [];
        this.character = null;
        this.characterUsed = false;
        this.isInJail = false;
        this.jailTurns = 0;
        this.getOutOfJailCards = 0;
        this.doublesCount = 0;
        this.isBankrupt = false;
        this.color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        this.monopolyCount = 0;
    }
}

class Game {
    constructor(playerSockets, gameTimeInSeconds) {
        this.board = JSON.parse(JSON.stringify(boardData.map(square => ({ ...square, ownerId: null, ownerColor: null, buildings: 0, taxMultiplier: 1, isUpgraded: false }))));
        this.players = playerSockets.map(socket => new Player(socket.id, socket.name));
        this.currentPlayerIndex = 0;
        this.currentPhase = 'rolling';
        this.dice = [0, 0];
        this.message = 'Trận đấu bắt đầu! Chúc người chơi may mắn.';
        this.opportunityDeck = this.shuffle([...opportunityCards]);
        this.destinyDeck = this.shuffle([...destinyCards]);
        this.characterDeck = this.shuffle([...characterCards]);
        this.lastEventCard = null;

        // --- LOGIC HẸN GIỜ ---
        this.remainingTime = gameTimeInSeconds; // Khởi tạo thời gian còn lại
        this.turnTimeLimit = 30; // 30 giây cho mỗi lượt
        this.turnTimeRemaining = this.turnTimeLimit;
        // ---------------------

        this.assignInitialCharacters();
        this.applyStartingCharacterEffects();
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    // Thêm method mới để lấy thời gian lượt còn lại
    getGameState() {
        return {
            board: this.board,
            players: this.players,
            currentPlayerId: this.players[this.currentPlayerIndex].id,
            currentPhase: this.currentPhase,
            dice: this.dice,
            message: this.message,
            lastEventCard: this.lastEventCard,
            remainingTime: this.remainingTime, // Gửi thời gian còn lại cho client
            turnTimeRemaining: this.turnTimeRemaining,
            turnTimeLimit: this.turnTimeLimit,
        };
    }

    // Method mới để reset thời gian lượt
    resetTurnTimer() {
        this.turnTimeRemaining = this.turnTimeLimit;
    }

    // Method mới để xử lý hết giờ lượt
    handleTurnTimeout() {
        if (this.currentPhase === 'game_over') return;
        
        this.message = `${this.getCurrentPlayer().name} đã hết thời gian lượt!`;
        this.endTurn();
    }

    // --- CÁC HÀM CŨ GIỮ NGUYÊN ---
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }
    
    drawEventCard() {
        const player = this.getCurrentPlayer();
        const isOpportunity = Math.random() < 0.5;
        const deck = isOpportunity ? this.opportunityDeck : this.destinyDeck;
        const cardType = isOpportunity ? 'Cơ Hội' : 'Vận Mệnh';
        const card = deck.shift();
        deck.push(card);

        this.message = `${cardType}: ${card.text}`;
        
        this.lastEventCard = {
            type: cardType,
            text: card.text
        };

        this.applyCardEffect(player, card);
    }

    assignInitialCharacters() {
        this.players.forEach(player => {
            if (this.characterDeck.length > 0) {
                player.character = this.characterDeck.pop();
            }
        });
    }

    applyStartingCharacterEffects() {
        this.players.forEach(player => {
            if (player.character && player.character.effect && player.character.effect.type === 'start_money') {
                player.money += player.character.effect.value;
            }
        });
    }

    handleAction(playerId, action) {
        if (playerId !== this.getCurrentPlayer().id && this.currentPhase !== 'game_over') {
            return;
        }

        switch (action.type) {
            case 'rollDice': this.rollDice(); break;
            case 'buyProperty': this.buyProperty(); break;
            case 'build': this.buildOnProperty(action.payload.squareId); break;
            case 'endTurn': this.endTurn(); break;
            case 'payBail': this.payToGetOutOfJail(); break;
            case 'useJailCard': this.useGetOutOfJailCard(); break;
            case 'useCharacterCard': this.useCharacterCard(); break;
            case 'teleportTo': this.teleportPlayer(action.payload.squareId); break;
            case 'organizeFestival': this.organizeFestival(action.payload.squareId); break;
            default: break;
        }
    }

    useCharacterCard() {
        const player = this.getCurrentPlayer();
        if (!player.character || player.characterUsed) {
            this.message = "Bạn không có thẻ nhân vật hoặc đã sử dụng rồi.";
            return;
        }

        const effect = player.character.effect;
        if (!effect) {
            this.message = "Thẻ nhân vật này không có hiệu ứng.";
            return;
        }

        this.message = `${player.name} sử dụng kỹ năng của ${player.character.name}: ${player.character.description}`;
        
        let isActionable = true;

        switch (effect.type) {
            case 'teleport':
                this.currentPhase = 'teleport';
                this.message += "\nHãy chọn một ô trên bàn cờ để di chuyển đến.";
                break;
            case 'free_build':
                player.money += 50000;
                this.message += `\nBạn nhận được 50,000đ để hỗ trợ xây dựng.`;
                break;
            case 'collect_tax_from_all':
                this.players.forEach(p => {
                    if (p.id !== player.id && !p.isBankrupt) {
                        const tax = Math.floor(p.money * effect.value);
                        p.money -= tax;
                        player.money += tax;
                    }
                });
                this.message += `\n${player.name} thu thuế từ tất cả người chơi khác.`;
                break;
            case 'destroy_building':
                this.currentPhase = 'destroy_building_select';
                this.message += `\nHãy chọn một công trình của đối thủ để phá hủy.`;
                break;
            default:
                this.message += `\nKỹ năng này là kỹ năng bị động hoặc không thể kích hoạt ngay bây giờ.`;
                isActionable = false;
                break;
        }

        if (isActionable) {
            player.characterUsed = true;
        }
    }

    rollDice() {
        const player = this.getCurrentPlayer();
        if (this.currentPhase !== 'rolling' || player.isBankrupt) return;

        this.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        const isDouble = this.dice[0] === this.dice[1];

        if (player.isInJail) {
            this.handleJailRoll(player, isDouble);
            return;
        }

        if (isDouble) player.doublesCount++;
        else player.doublesCount = 0;

        if (player.doublesCount === 3) {
            this.message = `${player.name} gieo 3 lần đôi liên tiếp! Bị giam cầm.`;
            this.sendPlayerToJail(player);
            return;
        }

        this.movePlayer(this.dice[0] + this.dice[1]);

        if (this.currentPhase !== 'game_over') {
             if (isDouble) {
                this.message += `\n${player.name} gieo được đôi, được tung xúc xắc một lần nữa!`;
                this.currentPhase = 'rolling';
                this.resetTurnTimer(); // Reset timer khi được đổ xúc xắc lại
            } else {
                if(this.currentPhase === 'rolling') {
                    this.currentPhase = 'management';
                    this.resetTurnTimer(); // Reset timer khi chuyển sang phase management
                }
            }
        }
    }

    movePlayer(steps) {
        const player = this.getCurrentPlayer();
        const oldPosition = player.position;
        player.position = (player.position + steps) % this.board.length;
        this.message = `${player.name} di chuyển ${steps} bước đến ô ${this.board[player.position].name}.`;

        if (player.position < oldPosition && !player.isBankrupt) {
            const passGoBonus = (player.character && player.character.effect && player.character.effect.type === 'pass_go_bonus') ? player.character.effect.value : 0;
            const totalReceived = 200000 + passGoBonus;
            player.money += totalReceived;
            this.message += `\nĐi qua ô LẬP QUỐC, ${player.name} nhận ${totalReceived} đ.`;
        }
        this.processLandingOnSquare();
    }

    processLandingOnSquare() {
        const player = this.getCurrentPlayer();
        const square = this.board[player.position];
        switch (square.type) {
            case 'property':
            case 'river':
                if (square.ownerId === null) { this.currentPhase = 'management'; }
                else if (square.ownerId !== player.id && !this.players.find(p => p.id === square.ownerId).isInJail) { this.payRent(); }
                break;
            case 'event': this.drawEventCard(); break;
            case 'jail': this.message += `\nChỉ là đi thăm nhà tù thôi!`; break;
            case 'go_to_jail':
                this.message += `\nĐi thẳng vào tù! Không được nhận tiền khi đi qua ô LẬP QUỐC.`;
                this.sendPlayerToJail(player);
                break;
            case 'tax':
                const taxAmount = square.price;
                player.money -= taxAmount;
                this.message += `\nBạn phải trả thuế cho quốc khố ${taxAmount} đ.`;
                this.checkPlayerForBankruptcy(player);
                break;
            case 'ngua_o':
                this.currentPhase = 'teleport';
                this.message += `\nBạn được chọn nhảy vào ô bất kỳ trên bàn cờ.`;
                break;
            case 'le_hoi':
                this.currentPhase = 'festival';
                this.message += `\nBạn được chọn 1 vùng đất của mình để tổ chức lễ hội và tăng thuế ở vùng đó lên gấp đôi.`;
                break;
            default: break;
        }
    }

    buyProperty() {
        const player = this.getCurrentPlayer();
        const square = this.board[player.position];
        if (this.currentPhase !== 'management' || square.ownerId !== null) return;
        if (player.money >= square.price) {
            player.money -= square.price;
            square.ownerId = player.id;
            square.ownerColor = player.color;
            player.properties.push(square.id);
            this.message = `${player.name} đã mua thành công ${square.name}.`;
            this.checkPlayerForMonopoly(player, square);
        } else {
            this.message = `Không đủ tiền để mua ${square.name}.`;
        }
    }

    buildOnProperty(squareId) {
        const player = this.getCurrentPlayer();
        const square = this.board.find(sq => sq.id === squareId);
        if (!square || square.ownerId !== player.id || player.money < square.buildCost || square.buildings >= 6) return;

        // Tính toán chi phí xây dựng
        let buildCost = square.buildCost;
        if (square.buildingType === 'Làng') {
            buildCost *= 1.2; // Tăng 20% chi phí cho Làng
        }

        player.money -= buildCost;
        square.buildings++;

        // Logic nâng cấp công trình
        if (square.buildings === 2) {
            square.buildings = 1;
            square.buildingType = 'Chùa';
            this.message = `${player.name} đã nâng cấp 2 nhà thành 1 Chùa trên ${square.name}.`;
        } else if (square.buildings === 2 && square.buildingType === 'Chùa') {
            square.buildings = 1;
            square.buildingType = 'Khu quân sự';
            this.message = `${player.name} đã nâng cấp 2 Chùa thành 1 Khu quân sự trên ${square.name}.`;
        } else if (square.buildings === 2 && square.buildingType === 'Khu quân sự') {
            square.buildings = 1;
            square.buildingType = 'Làng';
            square.isUpgraded = true; // Đánh dấu đã nâng cấp tối đa
            this.message = `${player.name} đã nâng cấp 2 Khu quân sự thành 1 Làng trên ${square.name}. Bất động sản này giờ đây không thể bị người khác mua lại.`;
        } else {
            this.message = `${player.name} đã xây 1 ${square.buildingType || 'nhà'} trên ${square.name}.`;
        }
    }

    payRent() {
        const player = this.getCurrentPlayer();
        const square = this.board[player.position];
        const owner = this.players.find(p => p.id === square.ownerId);
        if (!owner) return;
        let rentAmount = 0;
        if (square.type === 'river') {
            const riversOwnedByOwner = owner.properties.filter(id => this.board[id].type === 'river').length;
            rentAmount = 25000 * Math.pow(2, riversOwnedByOwner - 1);
        } else {
            rentAmount = square.rent[square.buildings] * square.taxMultiplier;
        }
        player.money -= rentAmount;
        owner.money += rentAmount;
        this.message = `${player.name} đã trả ${rentAmount} đ tiền thuê cho ${owner.name}.`;
        this.checkPlayerForBankruptcy(player);
    }
    
    sendPlayerToJail(player) {
        player.position = this.board.findIndex(sq => sq.type === 'jail');
        player.isInJail = true;
        player.jailTurns = 0;
        player.doublesCount = 0;
        this.endTurn();
    }

    handleJailRoll(player, isDouble) {
        this.message = `${player.name} đang ở trong tù và gieo được ${this.dice[0]}-${this.dice[1]}.`;
        if (isDouble) {
            player.isInJail = false;
            player.jailTurns = 0;
            this.message += " Thật may mắn! Gieo được đôi, bạn đã được tự do!";
            this.currentPhase = 'management';
        } else {
            player.jailTurns++;
            if (player.jailTurns >= 3) {
                this.message += " Đã ở tù 3 lượt. Bạn phải trả tiền phạt 50,000để ra tù.";
                player.money -= 50000;
                player.isInJail = false;
                player.jailTurns = 0;
                this.checkPlayerForBankruptcy(player);
                if (!player.isBankrupt) {
                    this.currentPhase = 'management';
                } else {
                    this.endTurn();
                }
            } else {
                this.message += ` Còn ${3 - player.jailTurns} lượt trong tù.`;
                this.endTurn();
            }
        }
    }

    rollDice() {
        const player = this.getCurrentPlayer();
        if (this.currentPhase !== 'rolling' || player.isBankrupt) return;

        this.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        const isDouble = this.dice[0] === this.dice[1];

        if (player.isInJail) {
            this.handleJailRoll(player, isDouble);
            return;
        }

        if (isDouble) player.doublesCount++;
        else player.doublesCount = 0;

        if (player.doublesCount === 3) {
            this.message = `${player.name} gieo 3 lần đôi liên tiếp! Bị giam cầm.`;
            this.sendPlayerToJail(player);
            return;
        }

        this.movePlayer(this.dice[0] + this.dice[1]);

        if (this.currentPhase !== 'game_over') {
             if (isDouble) {
                this.message += `\n${player.name} gieo được đôi, được tung xúc xắc một lần nữa!`;
                this.currentPhase = 'rolling';
                this.resetTurnTimer(); // Reset timer khi được đổ xúc xắc lại
            } else {
                if(this.currentPhase === 'rolling') {
                    this.currentPhase = 'management';
                    this.resetTurnTimer(); // Reset timer khi chuyển sang phase management
                }
            }
        }
    }

    movePlayer(steps) {
        const player = this.getCurrentPlayer();
        const oldPosition = player.position;
        player.position = (player.position + steps) % this.board.length;
        this.message = `${player.name} di chuyển ${steps} bước đến ô ${this.board[player.position].name}.`;

        if (player.position < oldPosition && !player.isBankrupt) {
            const passGoBonus = (player.character && player.character.effect && player.character.effect.type === 'pass_go_bonus') ? player.character.effect.value : 0;
            const totalReceived = 200000 + passGoBonus;
            player.money += totalReceived;
            this.message += `\nĐi qua ô LẬP QUỐC, ${player.name} nhận ${totalReceived} đ.`;
        }
        this.processLandingOnSquare();
    }

    processLandingOnSquare() {
        const player = this.getCurrentPlayer();
        const square = this.board[player.position];
        switch (square.type) {
            case 'property':
            case 'river':
                if (square.ownerId === null) { this.currentPhase = 'management'; }
                else if (square.ownerId !== player.id && !this.players.find(p => p.id === square.ownerId).isInJail) { this.payRent(); }
                break;
            case 'event': this.drawEventCard(); break;
            case 'jail': this.message += `\nChỉ là đi thăm nhà tù thôi!`; break;
            case 'go_to_jail':
                this.message += `\nĐi thẳng vào tù! Không được nhận tiền khi đi qua ô LẬP QUỐC.`;
                this.sendPlayerToJail(player);
                break;
            case 'tax':
                const taxAmount = square.price;
                player.money -= taxAmount;
                this.message += `\nBạn phải trả thuế cho quốc khố ${taxAmount} đ.`;
                this.checkPlayerForBankruptcy(player);
                break;
            case 'ngua_o':
                this.currentPhase = 'teleport';
                this.message += `\nBạn được chọn nhảy vào ô bất kỳ trên bàn cờ.`;
                break;
            case 'le_hoi':
                this.currentPhase = 'festival';
                this.message += `\nBạn được chọn 1 vùng đất của mình để tổ chức lễ hội và tăng thuế ở vùng đó lên gấp đôi.`;
                break;
            default: break;
        }
    }

    buyProperty() {
        const player = this.getCurrentPlayer();
        const square = this.board[player.position];
        if (this.currentPhase !== 'management' || square.ownerId !== null) return;
        if (player.money >= square.price) {
            player.money -= square.price;
            square.ownerId = player.id;
            square.ownerColor = player.color;
            player.properties.push(square.id);
            this.message = `${player.name} đã mua thành công ${square.name}.`;
            this.checkPlayerForMonopoly(player, square);
        } else {
            this.message = `Không đủ tiền để mua ${square.name}.`;
        }
    }

    buildOnProperty(squareId) {
        const player = this.getCurrentPlayer();
        const square = this.board.find(sq => sq.id === squareId);
        if (!square || square.ownerId !== player.id || player.money < square.buildCost || square.buildings >= 6) return;

        // Tính toán chi phí xây dựng
        let buildCost = square.buildCost;
        if (square.buildingType === 'Làng') {
            buildCost *= 1.2; // Tăng 20% chi phí cho Làng
        }

        player.money -= buildCost;
        square.buildings++;

        // Logic nâng cấp công trình
        if (square.buildings === 2) {
            square.buildings = 1;
            square.buildingType = 'Chùa';
            this.message = `${player.name} đã nâng cấp 2 nhà thành 1 Chùa trên ${square.name}.`;
        } else if (square.buildings === 2 && square.buildingType === 'Chùa') {
            square.buildings = 1;
            square.buildingType = 'Khu quân sự';
            this.message = `${player.name} đã nâng cấp 2 Chùa thành 1 Khu quân sự trên ${square.name}.`;
        } else if (square.buildings === 2 && square.buildingType === 'Khu quân sự') {
            square.buildings = 1;
            square.buildingType = 'Làng';
            square.isUpgraded = true; // Đánh dấu đã nâng cấp tối đa
            this.message = `${player.name} đã nâng cấp 2 Khu quân sự thành 1 Làng trên ${square.name}. Bất động sản này giờ đây không thể bị người khác mua lại.`;
        } else {
            this.message = `${player.name} đã xây 1 ${square.buildingType || 'nhà'} trên ${square.name}.`;
        }
    }

    payRent() {
        const player = this.getCurrentPlayer();
        const square = this.board[player.position];
        const owner = this.players.find(p => p.id === square.ownerId);
        if (!owner) return;
        let rentAmount = 0;
        if (square.type === 'river') {
            const riversOwnedByOwner = owner.properties.filter(id => this.board[id].type === 'river').length;
            rentAmount = 25000 * Math.pow(2, riversOwnedByOwner - 1);
        } else {
            rentAmount = square.rent[square.buildings] * square.taxMultiplier;
        }
        player.money -= rentAmount;
        owner.money += rentAmount;
        this.message = `${player.name} đã trả ${rentAmount} đ tiền thuê cho ${owner.name}.`;
        this.checkPlayerForBankruptcy(player);
    }
    
    sendPlayerToJail(player) {
        player.position = this.board.findIndex(sq => sq.type === 'jail');
        player.isInJail = true;
        player.jailTurns = 0;
        player.doublesCount = 0;
        this.endTurn();
    }

    handleJailRoll(player, isDouble) {
        this.message = `${player.name} đang ở trong tù và gieo được ${this.dice[0]}-${this.dice[1]}.`;
        if (isDouble) {
            player.isInJail = false;
            player.jailTurns = 0;
            this.message += " Thật may mắn! Gieo được đôi, bạn đã được tự do!";
            this.currentPhase = 'management';
        } else {
            player.jailTurns++;
            if (player.jailTurns >= 3) {
                this.message += " Đã ở tù 3 lượt. Bạn phải trả tiền phạt 50,000để ra tù.";
                player.money -= 50000;
                player.isInJail = false;
                player.jailTurns = 0;
                this.checkPlayerForBankruptcy(player);
                if (!player.isBankrupt) {
                    this.currentPhase = 'management';
                } else {
                    this.endTurn();
                }
            } else {
                this.message += ` Còn ${3 - player.jailTurns} lượt trong tù.`;
                this.endTurn();
            }
        }
    }

    payToGetOutOfJail() {
        const player = this.getCurrentPlayer();
        if (player.isInJail && player.money >= 50000) {
            player.money -= 50000;
            player.isInJail = false;
            player.jailTurns = 0;
            this.message = `${player.name} đã trả 50,000đ tiền phạt và được tự do.`;
            this.currentPhase = 'management';
        }
    }

    useGetOutOfJailCard() {
        const player = this.getCurrentPlayer();
        if (player.isInJail && player.getOutOfJailCards > 0) {
            player.getOutOfJailCards--;
            player.isInJail = false;
            player.jailTurns = 0;
            this.message = `${player.name} đã dùng thẻ Thoát giam cầm và được tự do.`;
            this.currentPhase = 'management';
        }
    }
    
    applyCardEffect(player, card) {
        switch (card.action) {
            case 'get_money': player.money += card.value; break;
            case 'pay_money': player.money -= card.value; break;
            case 'move_to':
                player.position = card.value;
                this.processLandingOnSquare();
                break;
            case 'get_out_of_jail_free': player.getOutOfJailCards++; break;
            case 'destroy_building':
                const propertiesWithBuildings = player.properties.map(id => this.board[id]).filter(sq => sq && sq.type === 'property' && sq.buildings > 0);
                if (propertiesWithBuildings.length > 0) {
                    propertiesWithBuildings.sort((a, b) => b.price - a.price);
                    const targetSquare = propertiesWithBuildings[0];
                    targetSquare.buildings--;
                    this.message += `\nMột công trình trên ${targetSquare.name} đã bị phá hủy!`;
                } else {
                    this.message += `\nMay mắn! Bạn không có công trình nào để bị phá hủy.`;
                }
                break;
        }
        this.checkPlayerForBankruptcy(player);
    }

    teleportPlayer(squareId) {
        if (this.currentPhase !== 'teleport') return;
        const player = this.getCurrentPlayer();
        player.position = squareId;
        this.message = `${player.name} đã dịch chuyển đến ${this.board[squareId].name}.`;
        this.processLandingOnSquare();
        if(this.currentPhase === 'teleport') {
            this.currentPhase = 'management';
        }
    }

    organizeFestival(squareId) {
        if (this.currentPhase !== 'festival') return;
        const square = this.board.find(sq => sq.id === squareId);
        if (square && square.ownerId === this.getCurrentPlayer().id) {
            square.taxMultiplier = 2;
            this.message = `Lễ hội được tổ chức tại ${square.name}, tiền thuê tại đây tăng gấp đôi.`;
            this.currentPhase = 'management';
        }
    }
    
    endTurn() {
        if (this.currentPhase === 'game_over') return;
        
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        if (activePlayers.length <= 1) {
            this.endGame(activePlayers.length === 1 ? activePlayers[0] : null, "là người sống sót cuối cùng");
            return;
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        while(this.getCurrentPlayer().isBankrupt) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
        
        this.currentPhase = 'rolling';
        this.resetTurnTimer(); // Reset timer khi chuyển lượt
        this.message = `Đến lượt của ${this.getCurrentPlayer().name}.`;
    }

    checkPlayerForMonopoly(player, square) {
        const era = square.era;
        if (!era) return;
        const eraProperties = this.board.filter(s => s.era === era && s.type === 'property');
        const ownedEraProperties = eraProperties.filter(s => s.ownerId === player.id);
        if (eraProperties.length > 0 && eraProperties.length === ownedEraProperties.length) {
            this.message += `\n${player.name} đã độc quyền Thời kỳ ${era}!`;
            ownedEraProperties.forEach(prop => {
                prop.taxMultiplier = 2;
            });
            player.monopolyCount++;
            this.checkPlayerForWin(player);
        }
    }
    
    checkPlayerForWin(player) {
        if (!player || this.currentPhase === 'game_over') return;
        const eraCounts = player.properties.reduce((accumulator, propertyId) => {
            const property = this.board[propertyId];
            if (property && property.era) {
                accumulator[property.era] = (accumulator[property.era] || 0) + 1;
            }
            return accumulator;
        }, {});
        for (const era in eraCounts) {
            if (eraCounts[era] >= 8) {
                this.endGame(player, `đã thống nhất được lãnh thổ của một thời kỳ`);
                return;
            }
        }
        const riversOwned = player.properties.filter(id => this.board[id] && this.board[id].type === 'river').length;
        if (riversOwned >= 4) {
            this.endGame(player, 'đã chiếm được cả 4 con sông lớn');
            return;
        }
        if (player.monopolyCount >= 3) {
            this.endGame(player, 'đã đạt được độc quyền 3 lần');
            return;
        }
    }

    checkPlayerForBankruptcy(player) {
        if (player.money < 0) {
            const totalAssetsValue = player.properties.reduce((sum, propId) => {
                const prop = this.board[propId];
                return sum + (prop.price / 2) + (prop.buildings * prop.buildCost / 2);
            }, 0);
            if (player.money + totalAssetsValue < 0) {
                player.isBankrupt = true;
                this.message += `\n${player.name} đã phá sản!`;
                this.handlePlayerBankruptcy(player);
            } else {
                this.message += `\n${player.name} không đủ tiền trả! Bạn cần bán tài sản để tiếp tục.`;
            }
        }
    }

    handlePlayerBankruptcy(bankruptPlayer) {
        bankruptPlayer.properties.forEach(propId => {
            const square = this.board[propId];
            if (square) {
                square.ownerId = null;
                square.ownerColor = null;
                square.buildings = 0;
                square.taxMultiplier = 1;
                square.isUpgraded = false;
            }
        });
        bankruptPlayer.properties = [];
        const remainingPlayers = this.players.filter(p => !p.isBankrupt);
        if (remainingPlayers.length === 1) {
            this.endGame(remainingPlayers[0], "là người sống sót cuối cùng");
        } else if (remainingPlayers.length === 0) {
            this.endGame(null, "Tất cả người chơi đã phá sản");
        }
    }

    // --- CÁC HÀM MỚI VÀ HÀM ĐƯỢC CHỈNH SỬA CHO LOGIC HẸN GIỜ ---

    /**
     * Hàm kết thúc game khi hết giờ.
     * Tính tổng tài sản để tìm người chiến thắng.
     */
    endGameByTime() {
        if (this.currentPhase === 'game_over') return;

        let winner = null;
        let maxAssets = -Infinity;

        this.players.forEach(player => {
            if (!player.isBankrupt) {
                // Tính tổng tài sản = tiền mặt + 50% giá trị đất + 50% giá trị nhà
                const totalAssets = player.money + player.properties.reduce((sum, propId) => {
                    const prop = this.board.find(p => p.id === propId);
                    if (!prop) return sum;
                    const propertyValue = prop.price || 0;
                    const buildingValue = (prop.buildings || 0) * (prop.buildCost || 0);
                    return sum + (propertyValue / 2) + (buildingValue / 2);
                }, 0);
                
                if (totalAssets > maxAssets) {
                    maxAssets = totalAssets;
                    winner = player;
                }
            }
        });
        
        this.endGame(winner, "hết giờ và có nhiều tài sản nhất");
    }

    /**
     * Hàm chung để kết thúc ván đấu.
     * @param {Player} winner - Người chơi chiến thắng.
     * @param {string} reason - Lý do chiến thắng.
     */
    endGame(winner, reason) {
        if (this.currentPhase === 'game_over') return; // Tránh kết thúc game nhiều lần
        this.currentPhase = 'game_over';
        if (winner) {
            this.message = `Trận đấu kết thúc! ${winner.name} đã chiến thắng vì ${reason}!`;
        } else {
            this.message = `Trận đấu kết thúc vì ${reason}.`;
        }
    }
}

module.exports = Game;