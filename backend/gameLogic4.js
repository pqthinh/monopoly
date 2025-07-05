// backend/gameLogic.js
const { boardData, characterCards } = require('./gameData');

class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.money = 2000000;
        this.position = 0;
        this.properties = [];
        this.character = null;
        this.isInJail = false;
        this.jailTurns = 0;
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); // Đảm bảo màu luôn có 6 ký tự
    }
}

class Game {
    constructor(playerSockets) {
        // --- TRẠNG THÁI GAME (STATE) ---
        this.board = JSON.parse(JSON.stringify(boardData.map(sq => ({ ...sq, ownerId: null, ownerColor: null, buildings: 0 }))));
        this.players = playerSockets.map(socket => new Player(socket.id, socket.playerName));
        this.currentPlayerIndex = 0;
        this.dice = [0, 0];
        this.doublesCount = 0;
        this.currentPhase = 'management'; // 'management', 'decision', 'jail'
        this.message = "Đã đủ 4 Hào Kiệt! Trận chiến bắt đầu!";

        this.assignCharacters();
        this.updateMessageForNewTurn();
    }

    // --- CÁC HÀM KHỞI TẠO ---
    assignCharacters() {
        const shuffledChars = [...characterCards].sort(() => 0.5 - Math.random());
        this.players.forEach((player, index) => {
            const character = shuffledChars[index];
            player.character = character;
            if (character.id === 'lac_long_quan') {
                player.money = 2500000;
            }
        });
    }

    // --- CÁC HÀM XỬ LÝ HÀNH ĐỘNG (LOGIC CHÍNH) ---
    rollDice() {
        if (this.currentPhase !== 'management') return;

        const currentPlayer = this.players[this.currentPlayerIndex];
        this.dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
        
        const oldPosition = currentPlayer.position;
        currentPlayer.position = (oldPosition + this.dice[0] + this.dice[1]) % this.board.length;

        this.message = `${currentPlayer.name} gieo được ${this.dice[0]} và ${this.dice[1]}.`;
        
        if (currentPlayer.position < oldPosition) {
            currentPlayer.money += 200000;
            this.message += "\nĐi qua LẬP QUỐC, nhận 200,000 tiền.";
        }

        this.message += `\nDi chuyển đến ô ${this.board[currentPlayer.position].name}.`;
        this.handleLanding();
    }

    handleLanding() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        const square = this.board[currentPlayer.position];

        if (square.type === 'property' && square.ownerId === null) {
            // Nếu là đất trống, chuyển sang phase quyết định
            this.currentPhase = 'decision';
            this.message += `\nBạn có muốn mua ${square.name} với giá ${square.price.toLocaleString()} không?`;
        } else if (square.type === 'property' && square.ownerId !== currentPlayer.id) {
            // Nếu là đất của người khác, trả tiền thuê
            const owner = this.players.find(p => p.id === square.ownerId);
            if (owner) {
                const rent = square.rent[square.buildings || 0];
                currentPlayer.money -= rent;
                owner.money += rent;
                this.message += `\nBạn phải trả ${rent.toLocaleString()} tiền thuê cho ${owner.name}.`;
            }
            this.endTurn(); // Tự động kết thúc lượt sau khi trả tiền
        } else {
            // Nếu là đất của mình hoặc ô sự kiện, kết thúc lượt
            this.endTurn();
        }
    }

    buyProperty() {
        if (this.currentPhase !== 'decision') return;
        
        const currentPlayer = this.players[this.currentPlayerIndex];
        const square = this.board[currentPlayer.position];

        if (square.price <= currentPlayer.money) {
            currentPlayer.money -= square.price;
            currentPlayer.properties.push(square.id);
            // SỬA LỖI: Gán cả ID và MÀU của chủ sở hữu
            square.ownerId = currentPlayer.id;
            square.ownerColor = currentPlayer.color; // << FIX HERE
            this.message = `${currentPlayer.name} đã mua ${square.name}.`;
        } else {
            this.message = `Bạn không đủ tiền để mua ${square.name}.`;
        }
        this.endTurn();
    }
    
    passAction() {
        if (this.currentPhase !== 'decision') return;
        this.message = `${this.players[this.currentPlayerIndex].name} đã quyết định không mua.`;
        this.endTurn();
    }
    
    // SỬA LỖI: Tách hàm endTurn ra để quản lý phase tốt hơn
    endTurn() {
        // Chuyển sang người chơi tiếp theo
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        
        // Đặt lại phase về 'management' cho người chơi mới
        this.currentPhase = 'management'; 
        
        // Cập nhật thông báo cho lượt mới
        this.updateMessageForNewTurn();
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