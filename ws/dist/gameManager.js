"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gamemanager = void 0;
const Game_1 = require("./Game");
const message_1 = require("./message");
const crypto_1 = require("crypto");
class Gamemanager {
    constructor() {
        this.games = [];
        this.users = [];
        this.rooms = [];
        this.pendingUser2 = null;
        this.pendingGameId = null;
    }
    addUser(user) {
        this.users.push(user);
        console.log("pushed user : ", user.id);
        this.addHandler(user);
    }
    addHandler(user) {
        user.socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const message = JSON.parse(data.toString());
            if (message.type == message_1.INIT_GAME) {
                if (this.pendingUser2) {
                    console.log("doosra user bhi aa gaya game start");
                    const game = new Game_1.Game({ id: this.pendingUser2.id, socket: this.pendingUser2.socket }, { id: user.id, socket: user.socket });
                    this.games.push(game);
                    this.pendingUser2 = null;
                }
                else {
                    this.pendingUser2 = user;
                    console.log("pahla user aa gaya");
                }
            }
            if (message.type == message_1.MOVE) {
                const game = this.games.find((game) => game.player1.id === user.id || game.player2.id == user.id);
                game === null || game === void 0 ? void 0 : game.makeMove(user.socket, message.payload.move);
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
                    user.socket.send(JSON.stringify({
                        type: "ERROR",
                        payload: "Room not found"
                    }));
                    return;
                }
                // Prevent joining if user is already the room owner
                if (((_a = room.player1) === null || _a === void 0 ? void 0 : _a.id) === user.id) {
                    user.socket.send(JSON.stringify({
                        type: "ERROR",
                        payload: "Cannot join your own room"
                    }));
                    return;
                }
                // Check if room is already full
                if (room.player2) {
                    user.socket.send(JSON.stringify({
                        type: "ERROR",
                        payload: "Room is already full"
                    }));
                    return;
                }
                // Set player2 and notify both players
                room.player2 = user;
                console.log("Player joined room:", { roomId, player1: (_b = room.player1) === null || _b === void 0 ? void 0 : _b.id, player2: room.player2.id });
                (_c = room.player1) === null || _c === void 0 ? void 0 : _c.socket.send(JSON.stringify({
                    type: "ROOM_JOINED",
                    payload: roomId,
                }));
                room.player2.socket.send(JSON.stringify({
                    type: "ROOM_JOINED",
                    payload: roomId,
                }));
            }
            if (message.type === "CREATE_ROOM") {
                try {
                    const roomId = (0, crypto_1.randomUUID)();
                    const room = {
                        player1: user,
                        player2: null,
                        gameId: roomId,
                    };
                    this.rooms.push(room);
                    user.socket.send(JSON.stringify({
                        type: "ROOM_CREATED",
                        payload: roomId,
                    }));
                }
                catch (error) {
                    console.log(error);
                }
            }
            if (message.type === "START_GAME") {
                const roomId = message.payload.roomId;
                const room = this.rooms.find((room) => room.gameId === roomId);
                if (!room) {
                    user.socket.send(JSON.stringify({
                        type: "ERROR",
                        payload: "Room not found",
                    }));
                }
                else {
                    if (room.player1 && room.player2) {
                        const game = new Game_1.Game({ id: room.player1.id, socket: room.player1.socket }, { id: room.player2.id, socket: room.player2.socket });
                        this.games.push(game);
                        this.rooms.splice(this.rooms.indexOf(room), 1);
                    }
                }
            }
            if (message.type === "LEAVE_ROOM") {
                const roomId = message.payload.roomId;
                const room = this.rooms.find((room) => room.gameId === roomId);
                console.log("leaving room", room === null || room === void 0 ? void 0 : room.gameId);
                if (room) {
                    if (room.player1 === user) {
                        room.player1 = null;
                        user.socket.send(JSON.stringify({
                            type: "LEAVE_ROOM_SUCCESS",
                            payload: roomId,
                        }));
                        (_d = room.player2) === null || _d === void 0 ? void 0 : _d.socket.send(JSON.stringify({
                            type: "OPPONENT_LEFT",
                            payload: roomId,
                        }));
                        this.rooms.splice(this.rooms.indexOf(room), 1);
                    }
                    else if (room.player2 === user) {
                        room.player2 = null;
                        (_e = room.player1) === null || _e === void 0 ? void 0 : _e.socket.send(JSON.stringify({
                            type: "ROOM_DELETED",
                            payload: roomId,
                        }));
                        user.socket.send(JSON.stringify({
                            type: "LEAVE_ROOM_SUCCESS",
                            payload: roomId,
                        }));
                    }
                }
            }
        }));
    }
    removeUser(socket, userId) {
        this.users = this.users.filter((user) => user.id !== userId);
        const gameIndex = this.games.findIndex((game) => game.player1.socket === socket || game.player2.socket === socket);
        if (gameIndex !== -1) {
            const game = this.games[gameIndex];
            if (game.player1.socket === socket) {
                if (game.player2) {
                    //game ends
                    game.player2.socket.send(JSON.stringify({
                        type: message_1.OPPONENT_DISCONNECTED,
                    }));
                }
                else {
                    this.games.splice(gameIndex, 1);
                }
            }
            else if (game.player2.socket === socket) {
                if (game.player1) {
                    //game ends
                    game.player1.socket.send(JSON.stringify({
                        type: message_1.OPPONENT_DISCONNECTED,
                    }));
                }
                else {
                    this.games.splice(gameIndex, 1);
                }
            }
        }
    }
}
exports.Gamemanager = Gamemanager;
