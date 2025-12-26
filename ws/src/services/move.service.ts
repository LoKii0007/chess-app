import prisma from "../config/db"

interface moveInterface {
    id: string
    from: string,
    to: string,
    gameId: string,
    userId: string
}

export const createMove = async (payload: moveInterface) => {
    try {
        await prisma.move.create({
            data: {
                ...payload,
                createdAt: new Date()
            }
        })
    } catch (error) {
        console.error('error creating move', error)
    }
}