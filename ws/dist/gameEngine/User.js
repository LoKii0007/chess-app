"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const crypto_1 = require("crypto");
const unique_names_generator_1 = require("unique-names-generator");
class User {
    constructor(socket) {
        this.socket = socket;
        this.id = (0, crypto_1.randomUUID)();
    }
    updateUserDetails(userDetails) {
        const { type, status, username, fName, lName, watchingMode, gameId } = userDetails;
        this.type = type;
        this.status = status;
        if (type === "RANDOM_USER") {
            this.username = (0, unique_names_generator_1.uniqueNamesGenerator)({ dictionaries: [unique_names_generator_1.adjectives, unique_names_generator_1.animals], separator: "-", length: 2 });
        }
        else {
            this.username = username;
            this.fName = fName;
            this.lName = lName;
        }
        if (status === "WATCHING") {
            this.watchingMode = watchingMode;
        }
        if (watchingMode === "GAME") {
            this.gameId = gameId;
        }
    }
}
exports.User = User;
