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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const gameManager_1 = require("./gameEngine/gameManager");
const User_1 = require("./gameEngine/User");
const redis_1 = require("./redis");
const dbQueue_1 = require("./utils/dbQueue");
const db_1 = __importDefault(require("./config/db"));
const app_1 = __importDefault(require("./app"));
const subscriber_1 = require("./utils/subscriber");
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const WS_PORT = Number(process.env.WS_PORT) || 8080;
// Start HTTP server
const httpServer = () => {
    app_1.default.listen(HTTP_PORT, () => {
        console.log(`HTTP server started on port ${HTTP_PORT}`);
    });
};
httpServer();
// Start WebSocket server
const wss = new ws_1.WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server started on port ${WS_PORT}`);
// Initialize game manager (will be used by WebSocket handlers)
const gameManager = new gameManager_1.GameManager();
// Initialize connections and start services
const initialize = () => __awaiter(void 0, void 0, void 0, function* () {
    //? db sonnection
    try {
        yield db_1.default.$connect();
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Failed to connect to database:', error);
    }
    //? redis connection
    try {
        yield (0, redis_1.connectRedis)();
        console.log('Redis connected successfully');
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
    }
    //? Start the database queue processor
    (0, dbQueue_1.startDbQueueProcessor)();
    //? subscribers
    try {
        yield (0, subscriber_1.startSubscribers)(gameManager);
        console.log('Subscribers started successfully');
    }
    catch (err) {
        console.log('error starting subscribers', err);
    }
});
initialize().catch((error) => {
    console.error('Failed to initialize application:', error);
    process.exit(1);
});
// Global error handling to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
wss.on("connection", function connection(ws, req) {
    const user = new User_1.User(ws);
    gameManager.addUser(user);
    // Handle connection close
    ws.on('close', (code, reason) => {
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
