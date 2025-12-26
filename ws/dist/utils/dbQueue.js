"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.stopDbQueueProcessor = exports.startDbQueueProcessor = exports.processDbQueue = exports.queueDbOperation = void 0;
const index_1 = require("../redis/index");
const userService = __importStar(require("../services/user.service"));
const gameService = __importStar(require("../services/game.service"));
const moveService = __importStar(require("../services/move.service"));
const message_1 = require("./message");
const DB_QUEUE_KEY = "db:operations:queue";
const queueDbOperation = (operation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!index_1.client.isOpen) {
            throw new Error('redis client is not connected');
        }
        console.log('lpush');
        yield index_1.client.lPush(DB_QUEUE_KEY, JSON.stringify(operation));
    }
    catch (error) {
        console.error('error queueing db operation', error);
    }
});
exports.queueDbOperation = queueDbOperation;
const processDbQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!index_1.client.isOpen) {
            throw new Error('redis client is not connected');
        }
        const result = yield index_1.client.brPop(DB_QUEUE_KEY, 1);
        if (result) {
            const operation = JSON.parse(result.element);
            yield executeOperation(operation);
        }
    }
    catch (error) {
        console.error('error in process db queue', error);
    }
});
exports.processDbQueue = processDbQueue;
let isProcessing = false;
const startDbQueueProcessor = () => {
    if (isProcessing)
        return;
    isProcessing = true;
    const processLoop = () => __awaiter(void 0, void 0, void 0, function* () {
        while (isProcessing) {
            yield (0, exports.processDbQueue)();
        }
    });
    processLoop();
    console.log('db process queue started');
};
exports.startDbQueueProcessor = startDbQueueProcessor;
const stopDbQueueProcessor = () => {
    isProcessing = false;
};
exports.stopDbQueueProcessor = stopDbQueueProcessor;
const executeOperation = (operation) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        switch (operation.type) {
            case "CREATE_USER":
                yield userService.createUser(operation.data);
                break;
            case message_1.CREATE_GAME:
                yield gameService.createGame(operation.data);
                break;
            case message_1.MOVE_MADE:
                yield moveService.createMove(operation.data);
                break;
        }
    }
    catch (error) {
        console.error('error in execute operation', error);
    }
});
