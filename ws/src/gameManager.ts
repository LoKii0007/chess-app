import { WebSocket } from "ws";
import { Game } from "./Game";
import { INIT_GAME, MOVE, OPPONENT_DISCONNECTED } from "./message";
import { User } from "./socketManager";
import { randomUUID } from "crypto";

interface Room {
  player1: User | null;
  player2: User | null;
  gameId: string;
}

export class Gamemanager {
  private games: Game[];
  private users: User[];
  private pendingUser2: User | null;
  private pendingGameId: string | null;
  private rooms: Room[];

  constructor() {
    this.games = [];
    this.users = [];
    this.rooms = [];
    this.pendingUser2 = null;
    this.pendingGameId = null;
  }

  addUser(user: User) {
    this.users.push(user);
    console.log("pushed user : ", user.id);
    this.addHandler(user);
  }

  private addHandler(user: User) {
    user.socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());

      if (message.type == INIT_GAME) {
        if (this.pendingUser2) {
          console.log("doosra user bhi aa gaya game start");
          const game = new Game(
            { id: this.pendingUser2.id, socket: this.pendingUser2.socket },
            { id: user.id, socket: user.socket }
          );
          this.games.push(game);
          this.pendingUser2 = null;
        } else {
          this.pendingUser2 = user;
          console.log("pahla user aa gaya");
        }
      }

      if (message.type == MOVE) {
        const game = this.games.find(
          (game) => game.player1.id === user.id || game.player2.id == user.id
        );
        game?.makeMove(user.socket, message.payload.move);
      }

      //   if (message.type === "JOIN_ROOM") {
      //     if (message.payload?.gameId) {
      //       const {
      //         payload: { gameId },
      //       } = message;
      //       const avaialableGame = this.games.find(
      //         (game) => game.gameId === gameId
      //       );
      //       if (avaialableGame) {
      //         const { player1, player2, gameId, board } = avaialableGame;
      //         if (player1 && player2) {
      //           user.socket.send(
      //             JSON.stringify({
      //               type: "game_full",
      //             })
      //           );
      //           return;
      //         } else if (!player1) {
      //           avaialableGame.player1 = user;
      //           player2.socket.send(
      //             JSON.stringify({
      //               type: "opponent_joined",
      //             })
      //           );
      //         } else if (!player2) {
      //           avaialableGame.player2 = user;
      //           player1.socket.send(
      //             JSON.stringify({
      //               type: "opponent_joined",
      //             })
      //           );
      //         }
      //         user.socket.send(
      //           JSON.stringify({
      //             type: "game_joined",
      //             payload: [gameId, board],
      //           })
      //         );
      //       }
      //     }
      //   }

      if (message.type === "JOIN_ROOM") {
        const roomId = message.payload.roomId;
        const room = this.rooms.find((room) => room.gameId === roomId);
        if (!room) {
          user.socket.send(
            JSON.stringify({
              type: "ERROR",
              payload: "Room not found",
            })
          );
          return;
        }

        // Prevent joining if user is already the room owner
        if (room.player1?.id === user.id) {
          user.socket.send(
            JSON.stringify({
              type: "ERROR",
              payload: "Cannot join your own room",
            })
          );
          return;
        }

        // Check if room is already full
        if (room.player2) {
          user.socket.send(
            JSON.stringify({
              type: "ERROR",
              payload: "Room is already full",
            })
          );
          return;
        }

        // Set player2 and notify both players
        room.player2 = user;
        console.log("Player joined room:", {
          roomId,
          player1: room.player1?.id,
          player2: room.player2.id,
        });

        room.player1?.socket.send(
          JSON.stringify({
            type: "ROOM_JOINED",
            payload: roomId,
          })
        );
        room.player2.socket.send(
          JSON.stringify({
            type: "ROOM_JOINED",
            payload: roomId,
          })
        );
      }

      if (message.type === "CREATE_ROOM") {
        try {
          const roomId = randomUUID();
          const room: Room = {
            player1: user,
            player2: null,
            gameId: roomId,
          };
          this.rooms.push(room);
          user.socket.send(
            JSON.stringify({
              type: "ROOM_CREATED",
              payload: roomId,
            })
          );
        } catch (error) {
          console.log(error);
        }
      }

      if (message.type === "START_GAME") {
        const roomId = message.payload.roomId;
        const room = this.rooms.find((room) => room.gameId === roomId);

        if (!room) {
          user.socket.send(
            JSON.stringify({
              type: "ERROR",
              payload: "Room not found",
            })
          );
          return;
        }

        // Check if user is the room owner
        if (room.player1?.id !== user.id) {
          user.socket.send(
            JSON.stringify({
              type: "ERROR",
              payload: "Only room owner can start the game",
            })
          );
          return;
        }

        if (!room.player2) {
          user.socket.send(
            JSON.stringify({
              type: "ERROR",
              payload: "Cannot start game without opponent",
            })
          );
          return;
        }

        if (room.player1 && room.player2) {
          const game = new Game(
            { id: room.player1.id, socket: room.player1.socket },
            { id: room.player2.id, socket: room.player2.socket }
          );
          this.games.push(game);

          // Send GAME_STARTED message to both players
          const gameStartedMessage = {
            type: "GAME_STARTED",
            payload: game.gameId, // Make sure your Game class has a gameId property
          };

          room.player1.socket.send(JSON.stringify(gameStartedMessage));
          room.player2.socket.send(JSON.stringify(gameStartedMessage));

          // Remove the room from rooms array
          this.rooms.splice(this.rooms.indexOf(room), 1);

          console.log("Game started:", game.gameId);
        }
      }

      if (message.type === "LEAVE_ROOM") {
        const roomId = message.payload.roomId;
        const room = this.rooms.find((room) => room.gameId === roomId);
        console.log("leaving room", room?.gameId);
        if (room) {
          if (room.player1 === user) {
            room.player1 = null;

            user.socket.send(
              JSON.stringify({
                type: "LEAVE_ROOM_SUCCESS",
                payload: roomId,
              })
            );
            room.player2?.socket.send(
              JSON.stringify({
                type: "OPPONENT_LEFT",
                payload: roomId,
              })
            );
            this.rooms.splice(this.rooms.indexOf(room), 1);
          } else if (room.player2 === user) {
            room.player2 = null;
            room.player1?.socket.send(
              JSON.stringify({
                type: "ROOM_DELETED",
                payload: roomId,
              })
            );
            user.socket.send(
              JSON.stringify({
                type: "LEAVE_ROOM_SUCCESS",
                payload: roomId,
              })
            );
          }
        }
      }
    });
  }

  removeUser(socket: WebSocket, userId: string) {
    this.users = this.users.filter((user) => user.id !== userId);
    const gameIndex = this.games.findIndex(
      (game) => game.player1.socket === socket || game.player2.socket === socket
    );
    if (gameIndex !== -1) {
      const game = this.games[gameIndex];
      if (game.player1.socket === socket) {
        if (game.player2) {
          //game ends
          game.player2.socket.send(
            JSON.stringify({
              type: OPPONENT_DISCONNECTED,
            })
          );
        } else {
          this.games.splice(gameIndex, 1);
        }
      } else if (game.player2.socket === socket) {
        if (game.player1) {
          //game ends
          game.player1.socket.send(
            JSON.stringify({
              type: OPPONENT_DISCONNECTED,
            })
          );
        } else {
          this.games.splice(gameIndex, 1);
        }
      }
    }
  }
}
