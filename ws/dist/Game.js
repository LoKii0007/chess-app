"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const message_1 = require("./message");
// import { db } from "./db";
const crypto_1 = require("crypto");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.moveCount = 0;
        this.gameId = (0, crypto_1.randomUUID)();
        this.player1.socket.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: {
                color: "w",
                gameId: this.gameId,
                whitePlayer: { name: "Player A", id: this.player1.id },
                blackPlayer: { name: "Player B", id: this.player2.id },
                fen: this.board.fen(),
                moves: [],
            },
        }));
        this.player2.socket.send(JSON.stringify({
            type: message_1.INIT_GAME,
            payload: {
                color: "b",
                gameId: this.gameId,
                whitePlayer: { name: "Player A", id: this.player1.id },
                blackPlayer: { name: "Player B", id: this.player2.id },
                fen: this.board.fen(),
                moves: [],
            },
        }));
    }
    makeMove(socket, move) {
        //validation
        //is the user valid
        if (this.moveCount % 2 === 0 && socket !== this.player1.socket) {
            console.log("player1 ki turn hai");
            return;
        }
        if (this.moveCount % 2 === 1 && socket !== this.player2.socket) {
            console.log("player2 ki turn hai");
            return;
        }
        //is the move valid
        console.log("move : ", move);
        try {
            this.board.move(move);
        }
        catch (error) {
            console.log(error);
            return;
        }
        //check if game is over
        if (this.board.isGameOver()) {
            const result = this.board.isDraw()
                ? "DRAW"
                : this.board.turn() === "w"
                    ? "BLACK_WINS"
                    : "WHITE_WINS";
            //sending the game over message to both players
            this.player1.socket.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: result,
            }));
            this.player2.socket.send(JSON.stringify({
                type: message_1.GAME_OVER,
                payload: result,
            }));
            return;
        }
        if (this.board.isCheck()) {
            this.player1.socket.send(JSON.stringify({
                type: message_1.CHECKMATE,
            }));
            this.player2.socket.send(JSON.stringify({
                type: message_1.CHECKMATE,
            }));
        }
        //send the updated board
        if (this.moveCount % 2 === 0) {
            console.log("p1 ne chal diya");
            this.player2.socket.send(JSON.stringify({
                type: message_1.MOVE,
                payload: move,
            }));
        }
        else {
            console.log("p2 ne chal diya");
            this.player1.socket.send(JSON.stringify({
                type: message_1.MOVE,
                payload: move,
            }));
        }
        this.moveCount++;
        console.log("movecount : ", this.moveCount);
    }
}
exports.Game = Game;
