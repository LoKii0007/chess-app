import http from 'http';
import app from './app';
import { handleWebSocket, initializeConnections } from './ws/socketManager';

const PORT = process.env.PORT || 3000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Start HTTP server
server.listen(PORT, () => {
    console.log(`HTTP & WebSocket server started on port ${PORT}`);
});

// Attach WebSocket to the same HTTP server
handleWebSocket(server)

initializeConnections().catch((error) => {
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