"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const gameManager_1 = require("./gameManager");
const socketManager_1 = require("./socketManager");
const crypto_1 = require("crypto");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log('started websocketserver');
const gameManager = new gameManager_1.Gamemanager();
// Keep-alive ping interval (every 30 seconds)
const PING_INTERVAL = 30000;
// Global error handling to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
wss.on("connection", function connection(ws, req) {
    const uniqueUserId = (0, crypto_1.randomUUID)();
    const user = new socketManager_1.User(ws, uniqueUserId);
    gameManager.addUser(user);
    // Set up keep-alive ping/pong
    const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        }
        else {
            clearInterval(pingInterval);
        }
    }, PING_INTERVAL);
    // Handle pong response
    ws.on('pong', () => {
        console.log('Received pong from client:', user.id);
    });
    // Handle connection close
    ws.on('close', (code, reason) => {
        console.log(`Connection closed for user ${user.id}. Code: ${code}, Reason: ${reason}`);
        clearInterval(pingInterval);
        try {
            gameManager.removeUser(ws, user.id);
        }
        catch (error) {
            console.error('Error removing user:', error);
        }
    });
    // Handle connection errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for user ${user.id}:`, error);
        clearInterval(pingInterval);
        try {
            gameManager.removeUser(ws, user.id);
        }
        catch (error) {
            console.error('Error removing user after error:', error);
        }
    });
});
wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});
console.log('WebSocket server is ready and monitoring for issues...');
