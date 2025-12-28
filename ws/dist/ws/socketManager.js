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
exports.initializeConnections = exports.handleWebSocket = exports.gameManager = exports.wss = void 0;
const ws_1 = require("ws");
const gameManager_1 = require("../gameEngine/gameManager");
const User_1 = require("../gameEngine/User");
const subscriber_1 = require("../utils/subscriber");
const redis_1 = require("../redis");
const dbQueue_1 = require("../utils/dbQueue");
const db_1 = __importDefault(require("../config/db"));
const WS_PORT = Number(process.env.WS_PORT) || 8080;
exports.wss = new ws_1.WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server started on port ${WS_PORT}`);
// Initialize game manager 
exports.gameManager = new gameManager_1.GameManager();
const handleWebSocket = () => {
    exports.wss.on("connection", function connection(ws, req) {
        const user = new User_1.User(ws);
        exports.gameManager.addUser(user);
        // Handle connection close
        ws.on('close', () => {
            try {
                exports.gameManager.removeUser(ws, user.id);
            }
            catch (error) {
                console.error('Error removing user:', error);
            }
        });
        // Handle connection errors
        ws.on('error', (error) => {
            console.error(`WebSocket error for user ${user.id}:`, error);
            try {
                exports.gameManager.removeUser(ws, user.id);
            }
            catch (error) {
                console.error('Error removing user after error:', error);
            }
        });
    });
    exports.wss.on('error', (error) => {
        console.error('WebSocket Server Error:', error);
    });
};
exports.handleWebSocket = handleWebSocket;
// Initialize connections and start services
const initializeConnections = () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, subscriber_1.startSubscribers)(exports.gameManager);
        console.log('Subscribers started successfully');
    }
    catch (err) {
        console.log('error starting subscribers', err);
    }
});
exports.initializeConnections = initializeConnections;
