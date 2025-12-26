interface User {
    id: string
    socket: WebSocket
    type: "RANDOM_USER" | "REAL_USER"
    username: string
    fName?: string
    lName?: string
    status: 'IDLE' | "PLAYING" | "WATCHING",
    watchingMode? : "GAMES_LIST" | "GAME"
}


