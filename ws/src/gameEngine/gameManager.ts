import { WebSocket } from "ws";
import { Game } from "./Game";
import { CREATE_ROOM, CREATE_USER, INIT_GAME, JOIN_ROOM, LEAVE_ROOM, LIVE_GAMES_LIST, MOVE, MOVE_MADE, OPPONENT_DISCONNECTED, START_GAME, LIVE_GAME } from "../utils/message";
import { User } from "./User";
import { randomUUID } from "crypto";
import { queueDbOperation } from "../utils/dbQueue";
import { Chess } from "chess.js";
import { client, publisherClient, subscriberClient } from "../redis";
import { gameListPayload, gamePayload } from "../utils/helper";

interface Room {
  player1: User | null;
  player2: User | null;
  gameId: string;
}

export interface LiveGame {
  player1: {
    id: string,
    name: string
  },
  player2: {
    id: string,
    name: string
  },
  gameId: string,
  startTime: Date,
}

export class GameManager {
  private games: Map<string, Game>;
  private users: Map<string, User>;
  private pendingUser2: User | null;
  private rooms: Room[];

  constructor() {
    this.games = new Map();
    this.users = new Map();
    this.rooms = [];
    this.pendingUser2 = null;
  }

  addUser(user: User) {
    this.users.set(user.id, user);
    console.log("pushed user : ", user.id);
    this.addHandler(user);
    this.roomHandler(user)
    this.liveGameHandler(user)
    this.liveGameListHandler(user)
  }

  private addHandler(user: User) {

    user.socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());


        if (message.type === INIT_GAME) {
          user.updateUserDetails(message.payload)

          if (this.pendingUser2) {
            console.log("doosra user bhi aa gaya game start");
            this.createGame(user, this.pendingUser2)
            this.pendingUser2 = null;
          } else {
            this.pendingUser2 = user;
            console.log("pahla user aa gaya");
          }
        }

        if (message.type === MOVE) {
          let game = this.games.get(message.payload.gameId)

          if (!game) {
            for (let g of this.games.values()) {
              if (g.player1.socket === user.socket || g.player2.socket === user.socket) {
                game = g
              }
            }
          }

          if (!game) {
            throw new Error('could not find the game')
          }

          game?.makeMove(user.socket, message.payload.move);

          //? publishing event
          const liveGames: any = []

          for (const game of this.games.values()) {
            const payload = gamePayload(game)
            liveGames.push(payload)
          }
          console.log('publishing move for live game')
          console.log('games found : ', liveGames.length)
          publisherClient.publish(LIVE_GAME, JSON.stringify({ games: liveGames }))

          //? updating db
          // queueDbOperation({
          //   type: MOVE_MADE, data: {
          //     gameId: game?.gameId,
          //     from: message.payload.move.from,
          //     to: message.payload.move.to,
          //     userId: user.id,
          //     id: randomUUID()
          //   }, timestamp: Date.now()
          // })
        }

        if (message.type === LIVE_GAMES_LIST) {

          user.socket.send(JSON.stringify({
            type: "LIVE_GAMES_LIST",
            payload: this.games
          }))

        }

      } catch (error) {
        console.error('Error handling message:', error);
        user.socket.send(JSON.stringify({
          type: "ERROR",
          payload: "Invalid message format"
        }));
      }
    });
  }

  private roomHandler(user: User) {

    user.socket.on("message", async (data) => {

      try {
        const message = JSON.parse(data.toString())

        if (message.type === JOIN_ROOM) {
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

        if (message.type === CREATE_ROOM) {
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

        if (message.type === START_GAME) {
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
            const game = this.createGame(room.player1, room.player2)

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

        if (message.type === LEAVE_ROOM) {
          const roomId = message.payload.roomId;
          const room = this.rooms.find((room) => room.gameId === roomId);
          console.log("leaving room", room?.gameId);
          if (room) {
            if (room.player1 === user) {
              console.log("player 1 left");
              room.player1 = null;

              user.socket.send(
                JSON.stringify({
                  type: "ROOM_DELETED",
                  payload: roomId,
                })
              );
              room.player2?.socket.send(
                JSON.stringify({
                  type: "ROOM_DELETED",
                  payload: roomId,
                })
              );
              this.rooms.splice(this.rooms.indexOf(room), 1);
            } else if (room.player2 === user) {
              console.log("player 2 left");
              room.player2 = null;
              room.player1?.socket.send(
                JSON.stringify({
                  type: "OPPONENT_LEFT",
                  payload: roomId,
                })
              );
              user.socket.send(
                JSON.stringify({
                  type: "LEFT_ROOM",
                  payload: roomId,
                })
              );
            }
          }
        }
      } catch (error) {
        console.error('Error handling message:', error);
        user.socket.send(JSON.stringify({
          type: "ERROR",
          payload: "Invalid message format"
        }));
      }

    })
  }

  private liveGameHandler(user: User) {
    user.socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === LIVE_GAME) {
          user.updateUserDetails(message.payload)
          console.log(user.id, user.status, user.watchingMode)

          const game = this.games.get(message.payload.gameId)

          if (!game) {
            throw new Error("game not found")
          }

          const payload = gamePayload(game)

          user.socket.send(JSON.stringify({
            type: "LIVE_GAME_UPDATES",
            payload
          }))
        }

      } catch (error) {
        console.error('Error handling message:', error);
        user.socket.send(JSON.stringify({
          type: "ERROR",
          payload: "Invalid message format"
        }));
      }
    });
  }

  private liveGameListHandler(user: User) {
    user.socket.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === LIVE_GAMES_LIST) {

          user.updateUserDetails(message.payload)

          const gamesList = []

          for (const game of this.games.values()) {
            const gameData = gameListPayload(game)
            gamesList.push(gameData)
          }

          user.socket.send(JSON.stringify({
            type: "LIVE_GAMES_LIST",
            payload: gamesList
          }))

        }

      } catch (error) {
        console.error('Error handling message:', error);
        user.socket.send(JSON.stringify({
          type: "ERROR",
          payload: "Invalid message format"
        }));
      }
    });
  }

  removeUser(socket: WebSocket, userId: string) {
    console.log("Removing user:", userId);

    //? Remove from users array
    this.users.delete(userId)

    // Remove from pending user if applicable
    if (this.pendingUser2 && this.pendingUser2.id === userId) {
      this.pendingUser2 = null;
      console.log("Removed pending user");
    }

    // Handle game disconnection
    let foundGame: Game | undefined;

    for (const game of this.games.values()) {
      if (
        game.player1.socket === socket ||
        game.player2.socket === socket
      ) {
        foundGame = game;
        break;
      }
    }


    if (foundGame) {
      const game = foundGame
      if (game.player1.socket === socket) {
        if (game.player2) {
          //game ends
          game.player2.socket.send(
            JSON.stringify({
              type: OPPONENT_DISCONNECTED,
            })
          );
        }
        this.removeGame(game.gameId)
      } else if (game.player2.socket === socket) {
        if (game.player1) {
          //game ends
          game.player1.socket.send(
            JSON.stringify({
              type: OPPONENT_DISCONNECTED,
            })
          );
        }
        this.removeGame(game.gameId)
      }
    }

    // Handle room disconnection
    const roomIndex = this.rooms.findIndex(
      (room) =>
        (room.player1 && room.player1.socket === socket) ||
        (room.player2 && room.player2.socket === socket)
    );
    if (roomIndex !== -1) {
      const room = this.rooms[roomIndex];
      if (room.player1 && room.player1.socket === socket) {
        console.log("Room owner disconnected, deleting room");
        if (room.player2) {
          room.player2.socket.send(
            JSON.stringify({
              type: "ROOM_DELETED",
              payload: room.gameId,
            })
          );
        }
        this.rooms.splice(roomIndex, 1);
      } else if (room.player2 && room.player2.socket === socket) {
        console.log("Player 2 disconnected from room");
        room.player2 = null;
        if (room.player1) {
          room.player1.socket.send(
            JSON.stringify({
              type: "OPPONENT_LEFT",
              payload: room.gameId,
            })
          );
        }
      }
    }
  }


  createGame(user1: User, user2: User): Game {
    const game = new Game(
      user2,
      user1
    );
    this.games.set(game.gameId, game)

    //* publish
    const liveGames: any = []
    this.games.forEach((game) => {
      const gameData = {
        player1: { id: game.player1.id, username: game.player1.username },
        player2: { id: game.player2.id, username: game.player2.username },
        startTime: game.startTime,
        gameId: game.gameId
      }
      liveGames.push(gameData)
    })

    publisherClient.publish(LIVE_GAMES_LIST, JSON.stringify({ liveGames }))

    //? updating db
    // queueDbOperation({
    //   type: "CREATE_GAME", data: {
    //     id: game.gameId,
    //     player1Id: user.id,
    //     player2Id: this.pendingUser2.id,
    //     gameStatus: "GAME_STARTED",
    //     gameResult: "PENDING",
    //     gameMode: "RANDOM"
    //   }, timestamp: Date.now()
    // })

    return game
  }


  removeGame(gameId: string) {
    this.games.delete(gameId);

    const liveGames: any = []
    this.games.forEach((game) => {
      const gameData = {
        player1: game.player1,
        player2: game.player2,
        startTime: game.startTime,
        gameId: game.gameId
      }
      liveGames.push(gameData)
    })
    publisherClient.publish(LIVE_GAMES_LIST, JSON.stringify({ liveGames }))
  }

  getGameListWatchers(): User[] {

    let watchers: User[] = []

    for (const user of this.users.values()) {
      if (user.status === "WATCHING" && user.watchingMode === "GAMES_LIST") {
        watchers.push(user)
      }
    }

    return watchers
  }

  getGameWatchers(): User[] {

    let watchers: User[] = []

    for (const user of this.users.values()) {
      if (user.status === "WATCHING" && user.watchingMode === "GAME") {
        watchers.push(user)
      }
    }

    return watchers
  }

  getUsers(): User[] {
    return Array.from(this.users.values());
  }

  getGames(): Game[] {
    return Array.from(this.games.values());
  }

  getGamesMap(): Map<string, Game> {
    return this.games
  }
}
