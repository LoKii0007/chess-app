import app from './app';
import { handleWebSocket, initializeConnections } from './ws/socketManager';

const HTTP_PORT = process.env.HTTP_PORT || 3000;

// Start HTTP server
export const httpServer = () => {
    app.listen(HTTP_PORT, () => {
        console.log(`HTTP server started on port ${HTTP_PORT}`);
    });
}

// httpServer()

handleWebSocket()

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