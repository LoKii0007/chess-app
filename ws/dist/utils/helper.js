"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamePayload = exports.gameListPayload = void 0;
const gameListPayload = (game) => {
    return {
        gameId: game.gameId,
        player1: { id: game.player1.id, username: game.player1.username },
        player2: { id: game.player2.id, username: game.player2.username },
        startTime: game.startTime
    };
};
exports.gameListPayload = gameListPayload;
const gamePayload = (game) => {
    return {
        gameId: game.gameId,
        board: game.board.fen(),
        player1: {
            username: game.player1.username,
            id: game.player1.id
        },
        player2: {
            username: game.player2.username,
            id: game.player2.id
        }
    };
};
exports.gamePayload = gamePayload;
