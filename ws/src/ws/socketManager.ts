import { WebSocketServer } from 'ws';
import { Server } from 'http';
import { GameManager } from '../gameEngine/gameManager';
import { User } from '../gameEngine/User';
import { startSubscribers } from '../utils/subscriber';
import { connectRedis } from '../redis';
import { startDbQueueProcessor } from '../utils/dbQueue';
import prisma from '../config/db';

// Initialize game manager 
export const gameManager = new GameManager();

export let wss: WebSocketServer;

export const handleWebSocket = (server: Server) => {
    // Attach WebSocket server to the HTTP server
    wss = new WebSocketServer({ server });
    console.log('WebSocket server attached to HTTP server');
    wss.on("connection", function connection(ws, req) {
        const user = new User(ws);
        gameManager.addUser(user);

        // Handle connection close
        ws.on('close', () => {
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
}

// Initialize connections and start services
export const initializeConnections = async () => {

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