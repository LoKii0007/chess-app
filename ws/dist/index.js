"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const gameManager_1 = require("./gameManager");
const socketManager_1 = require("./socketManager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log('started websocketserver');
const gameManager = new gameManager_1.Gamemanager();
wss.on("connection", function connection(ws) {
    gameManager.addUser(new socketManager_1.User(ws, 'sjhdbc'));
});
