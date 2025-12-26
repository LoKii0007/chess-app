import prisma from "../config/db"

interface roomInterface  {
    id : string
    player1Id : string,
    player2Id : string,
    gameStatus : string,
    gameResult : string
    gameMode : string
}

export const createGame = async (payload : roomInterface) => {
    try {
        const game = await prisma.game.create({
            data : {
                ...payload,
                createdAt : new Date(),
                updatedAt : new Date()
            }
        })
        console.log('game created', game)
    } catch (error) {
        console.error('error creating game', error)
    }
}
