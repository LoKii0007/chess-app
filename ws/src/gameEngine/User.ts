import { randomUUID } from "crypto";
import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";
import WebSocket from "ws";

type UserTypes = "RANDOM_USER" | "REAL_USER"
type UserStatus = 'IDLE' | "PLAYING" | "WATCHING"
type UserWatcherType = "GAMES_LIST" | "GAME"

export class User {
  public socket: WebSocket;
  public id: string;
  public username?: string
  public type?: UserTypes
  public fName?: string
  public lName?: string
  public status?: UserStatus
  public watchingMode?: UserWatcherType
  public gameId?: string | null

  constructor(socket: WebSocket) {
    this.socket = socket;
    this.id = randomUUID();
  }

  updateUserDetails(userDetails: User) {
    const { type, status, username, fName, lName, watchingMode, gameId } = userDetails
    this.type = type
    this.status = status

    if (type === "RANDOM_USER") {
      this.username = uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: "-", length: 2 })
    } else {
      this.username = username
      this.fName = fName
      this.lName = lName
    }

    if (status === "WATCHING") {
      this.watchingMode = watchingMode
    }
    
    if (watchingMode === "GAME") {
      this.gameId = gameId
    }
  }
}
