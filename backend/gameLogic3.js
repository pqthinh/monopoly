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
        this.color = '#' + Math.floor(Math.random()*16777215).toString(16);
    }
}

class Game {
    constructor(playerSockets) {
        this.players = playerSockets.map(socket => new Player(socket.id, socket.playerName));
        this.board = JSON.parse(JSON.stringify(boardData.map(sq => ({ ...sq, owner: null, buildings: 0 }))));
        this.currentPlayerIndex = 0;
        this.dice = [0, 0];
        this.doublesCount = 0;
        this.currentPhase = 'management';
        this.message = "Đã đủ 4 Hào Kiệt! Trận chiến bắt đầu!";

        this.assignCharacters();
        this.updateMessageForNewTurn();
    }

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

    rollDice() {
        if (this.currentPhase !== 'management') return;

        this.dice = [
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
        ];
        
        const currentPlayer = this.players[this.currentPlayerIndex];
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

        if (square.type === 'property' && square.owner === null) {
            this.currentPhase = 'decision';
            this.message += `\nBạn có muốn mua ${square.name} với giá ${square.price.toLocaleString()} không?`;
        } else if (square.type === 'property' && square.owner !== currentPlayer.id) {
            const owner = this.players.find(p => p.id === square.owner);
            if (owner) {
                const rent = square.rent[square.buildings || 0];
                currentPlayer.money -= rent;
                owner.money += rent;
                this.message += `\nBạn phải trả ${rent.toLocaleString()} tiền thuê cho ${owner.name}.`;
            }
            this.prepareForNextTurn();
        } else {
            this.prepareForNextTurn();
        }
    }

    buyProperty() {
        if (this.currentPhase !== 'decision') return;
        const currentPlayer = this.players[this.currentPlayerIndex];
        const square = this.board[currentPlayer.position];

        if (square.price <= currentPlayer.money) {
            currentPlayer.money -= square.price;
            currentPlayer.properties.push(square.id);
            square.owner = currentPlayer.id;
            this.message = `${currentPlayer.name} đã mua ${square.name}.`;
        } else {
            this.message = `Bạn không đủ tiền để mua ${square.name}.`;
        }
        this.prepareForNextTurn();
    }
    
    passAction() {
        if (this.currentPhase !== 'decision') return;
        this.message = `${this.players[this.currentPlayerIndex].name} đã quyết định không mua.`;
        this.prepareForNextTurn();
    }

    prepareForNextTurn() {
        // Tạm thời chuyển lượt ngay lập tức.
        // Logic gieo đôi sẽ được thêm vào đây.
        this.nextTurn();
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.currentPhase = 'management';
        this.updateMessageForNewTurn();
    }
    
    updateMessageForNewTurn() {
        const nextPlayer = this.players[this.currentPlayerIndex];
        this.message = `Đến lượt của ${nextPlayer.name}.`;
    }

    getGameState() {
        return {
            players: this.players,
            board: this.board,
            currentPlayerIndex: this.currentPlayerIndex,
            dice: this.dice,
            currentPhase: this.currentPhase,
            message: this.message,
        };
    }
}

module.exports = Game;