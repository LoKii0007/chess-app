import { Chess } from "chess.js";
import { WebSocket } from "ws";
import { CHECKMATE, GAME_OVER, INIT_GAME, MOVE } from "./message";
// import { db } from "./db";
import { randomUUID } from "crypto";

export class Game {
  public player1: { id: string; socket: WebSocket };
  public player2: { id: string; socket: WebSocket };
  public board: Chess;
  public startTime: Date;
  public moveCount: number;
  public gameId: string;

  constructor(
    player1: { id: string; socket: WebSocket },
    player2: { id: string; socket: WebSocket }
  ) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.moveCount = 0;
    this.gameId = randomUUID();
    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "w",
          gameId: this.gameId,
          whitePlayer: { name: "loki", id: this.player1.id },
          blackPlayer: { name: "loki", id: this.player2.id },
          fen: this.board.fen(),
          moves: [],
        },
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "b",
          gameId: this.gameId,
          whitePlayer: { name: "loki", id: this.player1.id },
          blackPlayer: { name: "loki", id: this.player2.id },
          fen: this.board.fen(),
          moves: [],
        },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
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
    } catch (error) {
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
      this.player1.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: result,
        })
      );

      this.player2.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: result,
        })
      );

      return;
    }

    if (this.board.isCheck()) {
      this.player1.socket.send(
        JSON.stringify({
          type: CHECKMATE,
        })
      );

      this.player2.socket.send(
        JSON.stringify({
          type: CHECKMATE,
        })
      );
    }

    //send the updated board
    if (this.moveCount % 2 === 0) {
      console.log("p1 ne chal diya");
      this.player2.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      console.log("p2 ne chal diya");
      this.player1.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
    console.log("movecount : ", this.moveCount);
  }
}
