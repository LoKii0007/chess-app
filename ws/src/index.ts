import { WebSocketServer } from 'ws';
import { GameManager } from './gameEngine/gameManager';
import { User } from './gameEngine/User';
import { connectRedis } from './redis';
import { startDbQueueProcessor } from './utils/dbQueue';
import prisma from './config/db';
import app from './app';
import { startSubscribers } from './utils/subscriber';

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const WS_PORT: number = Number(process.env.WS_PORT) || 8080;

// Start HTTP server
const httpServer = () => {
    app.listen(HTTP_PORT, () => {
        console.log(`HTTP server started on port ${HTTP_PORT}`);
    });
}

httpServer()

// Start WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server started on port ${WS_PORT}`);

// Initialize game manager (will be used by WebSocket handlers)
const gameManager = new GameManager();

// Initialize connections and start services
const initialize = async () => {

    //? db sonnection
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Failed to connect to database:', error);
    }

    //? redis connection
    try {
        await connectRedis();
        console.log('Redis connected successfully');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error; 
    }

    //? Start the database queue processor
    startDbQueueProcessor();

    //? subscribers
    try {
        await startSubscribers(gameManager);
        console.log('Subscribers started successfully');
    } catch (err) {
        console.log('error starting subscribers', err);
    }
};

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
    const user = new User(ws);
    gameManager.addUser(user);

    // Handle connection close
    ws.on('close', (code, reason) => {
        try {
            gameManager.removeUser(ws, user.id);
        } catch (error) {
            console.error('Error removing user:', error);
        }
    });

    // Handle connection errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for user ${user.id}:`, error);
        try {
            gameManager.removeUser(ws, user.id);
        } catch (error) {
            console.error('Error removing user after error:', error);
        }
    });
});


wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});

console.log('WebSocket server is ready and monitoring for issues...');

