import { type Square } from "chess.js";

export type UserStatus = 'IDLE' | "PLAYING" | "WATCHING"
export type UserType = "RANDOM_USER" | "REAL_USER"
export type UserWatchingModes = "GAMES_LIST" | "GAME"


export interface UserPayload {
    id?: string
    type: UserStatus
    username?: string
    fName?: string
    lName?: string
    status: UserStatus
    watchingMode?: UserWatchingModes
}

export interface Metadata {
    whitePlayer: {
        id: string;
        username: string;
        fName?: string,
        lName?: string
    };
    blackPlayer: {
        id: string;
        username: string;
        fName?: string,
        lName?: string
    };
}


export interface Move {
    from: Square;
    to: Square;
    san?: string; 
  }
  