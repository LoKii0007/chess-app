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
exports.GameManager = void 0;
const Game_1 = require("./Game");
const message_1 = require("../utils/message");
const crypto_1 = require("crypto");
const redis_1 = require("../redis");
const helper_1 = require("../utils/helper");
class GameManager {
    constructor() {
        this.games = new Map();
        this.users = new Map();
        this.rooms = [];
        this.pendingUser2 = null;
    }
    addUser(user) {
        this.users.set(user.id, user);
        console.log("pushed user : ", user.id);
        this.addHandler(user);
        this.roomHandler(user);
        this.liveGameHandler(user);
        this.liveGameListHandler(user);
    }
    addHandler(user) {
        user.socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === message_1.INIT_GAME) {
                    user.updateUserDetails(message.payload);
                    if (this.pendingUser2) {
                        console.log("doosra user bhi aa gaya game start");
                        this.createGame(user, this.pendingUser2);
                        this.pendingUser2 = null;
                    }
                    else {
                        this.pendingUser2 = user;
                        console.log("pahla user aa gaya");
                    }
                }
                if (message.type === message_1.MOVE) {
                    let game = this.games.get(message.payload.gameId);
                    if (!game) {
                        for (let g of this.games.values()) {
                            if (g.player1.socket === user.socket || g.player2.socket === user.socket) {
                                game = g;
                            }
                        }
                    }
                    if (!game) {
                        throw new Error('could not find the game');
                    }
                    game === null || game === void 0 ? void 0 : game.makeMove(user.socket, message.payload.move);
                    //? publishing event
                    const liveGames = [];
                    for (const game of this.games.values()) {
                        const payload = (0, helper_1.gamePayload)(game);
                        liveGames.push(payload);
                    }
                    console.log('publishing move for live game');
                    console.log('games found : ', liveGames.length);
                    redis_1.publisherClient.publish(message_1.LIVE_GAME, JSON.stringify({ games: liveGames }));
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
                if (message.type === message_1.LIVE_GAMES_LIST) {
                    user.socket.send(JSON.stringify({
                        type: "LIVE_GAMES_LIST",
                        payload: this.games
                    }));
                }
            }
            catch (error) {
                console.error('Error handling message:', error);
                user.socket.send(JSON.stringify({
                    type: "ERROR",
                    payload: "Invalid message format"
                }));
            }
        }));
    }
    roomHandler(user) {
        user.socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            try {
                const message = JSON.parse(data.toString());
                if (message.type === message_1.JOIN_ROOM) {
                    const roomId = message.payload.roomId;
                    const room = this.rooms.find((room) => room.gameId === roomId);
                    if (!room) {
                        user.socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: "Room not found",
                        }));
                        return;
                    }
                    // Prevent joining if user is already the room owner
                    if (((_a = room.player1) === null || _a === void 0 ? void 0 : _a.id) === user.id) {
                        user.socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: "Cannot join your own room",
                        }));
                        return;
                    }
                    // Check if room is already full
                    if (room.player2) {
                        user.socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: "Room is already full",
                        }));
                        return;
                    }
                    // Set player2 and notify both players
                    room.player2 = user;
                    console.log("Player joined room:", {
                        roomId,
                        player1: (_b = room.player1) === null || _b === void 0 ? void 0 : _b.id,
                        player2: room.player2.id,
                    });
                    (_c = room.player1) === null || _c === void 0 ? void 0 : _c.socket.send(JSON.stringify({
                        type: "ROOM_JOINED",
                        payload: roomId,
                    }));
                    room.player2.socket.send(JSON.stringify({
                        type: "ROOM_JOINED",
                        payload: roomId,
                    }));
                }
                if (message.type === message_1.CREATE_ROOM) {
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
                if (message.type === message_1.START_GAME) {
                    const roomId = message.payload.roomId;
                    const room = this.rooms.find((room) => room.gameId === roomId);
                    if (!room) {
                        user.socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: "Room not found",
                        }));
                        return;
                    }
                    // Check if user is the room owner
                    if (((_d = room.player1) === null || _d === void 0 ? void 0 : _d.id) !== user.id) {
                        user.socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: "Only room owner can start the game",
                        }));
                        return;
                    }
                    if (!room.player2) {
                        user.socket.send(JSON.stringify({
                            type: "ERROR",
                            payload: "Cannot start game without opponent",
                        }));
                        return;
                    }
                    if (room.player1 && room.player2) {
                        const game = this.createGame(room.player1, room.player2);
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
                if (message.type === message_1.LEAVE_ROOM) {
                    const roomId = message.payload.roomId;
                    const room = this.rooms.find((room) => room.gameId === roomId);
                    console.log("leaving room", room === null || room === void 0 ? void 0 : room.gameId);
                    if (room) {
                        if (room.player1 === user) {
                            console.log("player 1 left");
                            room.player1 = null;
                            user.socket.send(JSON.stringify({
                                type: "ROOM_DELETED",
                                payload: roomId,
                            }));
                            (_e = room.player2) === null || _e === void 0 ? void 0 : _e.socket.send(JSON.stringify({
                                type: "ROOM_DELETED",
                                payload: roomId,
                            }));
                            this.rooms.splice(this.rooms.indexOf(room), 1);
                        }
                        else if (room.player2 === user) {
                            console.log("player 2 left");
                            room.player2 = null;
                            (_f = room.player1) === null || _f === void 0 ? void 0 : _f.socket.send(JSON.stringify({
                                type: "OPPONENT_LEFT",
                                payload: roomId,
                            }));
                            user.socket.send(JSON.stringify({
                                type: "LEFT_ROOM",
                                payload: roomId,
                            }));
                        }
                    }
                }
            }
            catch (error) {
                console.error('Error handling message:', error);
                user.socket.send(JSON.stringify({
                    type: "ERROR",
                    payload: "Invalid message format"
                }));
            }
        }));
    }
    liveGameHandler(user) {
        user.socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === message_1.LIVE_GAME) {
                    user.updateUserDetails(message.payload);
                    console.log(user.id, user.status, user.watchingMode);
                    const game = this.games.get(message.payload.gameId);
                    if (!game) {
                        throw new Error("game not found");
                    }
                    const payload = (0, helper_1.gamePayload)(game);
                    user.socket.send(JSON.stringify({
                        type: "LIVE_GAME_UPDATES",
                        payload
                    }));
                }
            }
            catch (error) {
                console.error('Error handling message:', error);
                user.socket.send(JSON.stringify({
                    type: "ERROR",
                    payload: "Invalid message format"
                }));
            }
        }));
    }
    liveGameListHandler(user) {
        user.socket.on("message", (data) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message = JSON.parse(data.toString());
                if (message.type === message_1.LIVE_GAMES_LIST) {
                    user.updateUserDetails(message.payload);
                    const gamesList = [];
                    for (const game of this.games.values()) {
                        const gameData = (0, helper_1.gameListPayload)(game);
                        gamesList.push(gameData);
                    }
                    user.socket.send(JSON.stringify({
                        type: "LIVE_GAMES_LIST",
                        payload: gamesList
                    }));
                }
            }
            catch (error) {
                console.error('Error handling message:', error);
                user.socket.send(JSON.stringify({
                    type: "ERROR",
                    payload: "Invalid message format"
                }));
            }
        }));
    }
    removeUser(socket, userId) {
        console.log("Removing user:", userId);
        //? Remove from users array
        this.users.delete(userId);
        // Remove from pending user if applicable
        if (this.pendingUser2 && this.pendingUser2.id === userId) {
            this.pendingUser2 = null;
            console.log("Removed pending user");
        }
        // Handle game disconnection
        let foundGame;
        for (const game of this.games.values()) {
            if (game.player1.socket === socket ||
                game.player2.socket === socket) {
                foundGame = game;
                break;
            }
        }
        if (foundGame) {
            const game = foundGame;
            if (game.player1.socket === socket) {
                if (game.player2) {
                    //game ends
                    game.player2.socket.send(JSON.stringify({
                        type: message_1.OPPONENT_DISCONNECTED,
                    }));
                }
                this.removeGame(game.gameId);
            }
            else if (game.player2.socket === socket) {
                if (game.player1) {
                    //game ends
                    game.player1.socket.send(JSON.stringify({
                        type: message_1.OPPONENT_DISCONNECTED,
                    }));
                }
                this.removeGame(game.gameId);
            }
        }
        // Handle room disconnection
        const roomIndex = this.rooms.findIndex((room) => (room.player1 && room.player1.socket === socket) ||
            (room.player2 && room.player2.socket === socket));
        if (roomIndex !== -1) {
            const room = this.rooms[roomIndex];
            if (room.player1 && room.player1.socket === socket) {
                console.log("Room owner disconnected, deleting room");
                if (room.player2) {
                    room.player2.socket.send(JSON.stringify({
                        type: "ROOM_DELETED",
                        payload: room.gameId,
                    }));
                }
                this.rooms.splice(roomIndex, 1);
            }
            else if (room.player2 && room.player2.socket === socket) {
                console.log("Player 2 disconnected from room");
                room.player2 = null;
                if (room.player1) {
                    room.player1.socket.send(JSON.stringify({
                        type: "OPPONENT_LEFT",
                        payload: room.gameId,
                    }));
                }
            }
        }
    }
    createGame(user1, user2) {
        const game = new Game_1.Game(user2, user1);
        this.games.set(game.gameId, game);
        //* publish
        const liveGames = [];
        this.games.forEach((game) => {
            const gameData = (0, helper_1.gameListPayload)(game);
            liveGames.push(gameData);
        });
        redis_1.publisherClient.publish(message_1.LIVE_GAMES_LIST, JSON.stringify({ liveGames }));
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
        return game;
    }
    removeGame(gameId) {
        this.games.delete(gameId);
        const liveGames = [];
        this.games.forEach((game) => {
            const gameData = (0, helper_1.gameListPayload)(game);
            liveGames.push(gameData);
        });
        redis_1.publisherClient.publish(message_1.LIVE_GAMES_LIST, JSON.stringify({ liveGames }));
    }
    getGameListWatchers() {
        let watchers = [];
        for (const user of this.users.values()) {
            if (user.status === "WATCHING" && user.watchingMode === "GAMES_LIST") {
                watchers.push(user);
            }
        }
        return watchers;
    }
    getGameWatchers() {
        let watchers = [];
        for (const user of this.users.values()) {
            if (user.status === "WATCHING" && user.watchingMode === "GAME") {
                watchers.push(user);
            }
        }
        return watchers;
    }
    getUsers() {
        return Array.from(this.users.values());
    }
    getGames() {
        return Array.from(this.games.values());
    }
    getGamesMap() {
        return this.games;
    }
}
exports.GameManager = GameManager;
