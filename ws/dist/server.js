"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = void 0;
const app_1 = __importDefault(require("./app"));
const socketManager_1 = require("./ws/socketManager");
const PORT = process.env.PORT || 3000;
// Start HTTP server
const httpServer = () => {
    app_1.default.listen(PORT, () => {
        console.log(`HTTP server started on port ${PORT}`);
    });
};
exports.httpServer = httpServer;
(0, exports.httpServer)();
(0, socketManager_1.handleWebSocket)();
(0, socketManager_1.initializeConnections)().catch((error) => {
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
