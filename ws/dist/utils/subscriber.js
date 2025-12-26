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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSubscribers = void 0;
const redis_1 = require("../redis");
const message_1 = require("./message");
const helper_1 = require("./helper");
const startSubscribers = (gameManager) => __awaiter(void 0, void 0, void 0, function* () {
    if (!redis_1.subscriberClient.isOpen) {
        throw new Error('redis not connected');
    }
    yield redis_1.subscriberClient.subscribe(message_1.LIVE_GAMES_LIST, (message) => {
        console.log('subscribing to channel : ', message_1.LIVE_GAMES_LIST);
        try {
            const data = JSON.parse(message);
            //* send message to all the active viewers 
            gameManager.getGameListWatchers().forEach((viewer) => {
                viewer.socket.send(JSON.stringify({
                    type: message_1.LIVE_GAMES_LIST,
                    payload: data.liveGames
                }));
            });
        }
        catch (error) {
            console.log('error subscribing to channel : ', message_1.LIVE_GAMES_LIST);
            console.error("error : ", error);
        }
    });
    yield redis_1.subscriberClient.subscribe(message_1.LIVE_GAME, (message) => {
        console.log('subscribing to channel : ', message_1.LIVE_GAME);
        try {
            const data = JSON.parse(message);
            console.log('move published. sending to spectators');
            gameManager.getGameWatchers().forEach(user => {
                if (!user.gameId) {
                    throw new Error("gameId not fiund in user");
                }
                const game = gameManager.getGamesMap().get(user.gameId);
                if (!game) {
                    throw new Error("game not found");
                }
                const payload = (0, helper_1.gamePayload)(game);
                console.log('active speactators ', user.id);
                user.socket.send(JSON.stringify({
                    type: message_1.LIVE_GAME_UPDATES,
                    payload: payload
                }));
            });
        }
        catch (error) {
            console.error('error in game subscriber');
        }
    });
});
exports.startSubscribers = startSubscribers;
