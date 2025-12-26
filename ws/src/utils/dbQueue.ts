import { client } from '../redis/index'
import * as userService from '../services/user.service'
import * as gameService from '../services/game.service'
import * as moveService from '../services/move.service'
import { CREATE_GAME, MOVE_MADE } from './message'

const DB_QUEUE_KEY = "db:operations:queue"

export interface dbOperation {
    type: "CREATE_ROOM" | "CREATE_GAME" | "SAVE_MOVE" | "UPDATE_GAME" | "CREATE_USER" | "MOVE_MADE"
    data: any
    timestamp: number
}

export const queueDbOperation = async (operation: dbOperation): Promise<void> => {
    try {
        if (!client.isOpen) {
            throw new Error('redis client is not connected')
        }
        console.log('lpush')
        await client.lPush(DB_QUEUE_KEY, JSON.stringify(operation))
    } catch (error) {
        console.error('error queueing db operation', error)
    }
}

export const processDbQueue = async (): Promise<void> => {
    try {
        if (!client.isOpen) {
            throw new Error('redis client is not connected')
        }

        const result = await client.brPop(DB_QUEUE_KEY, 1)

        if (result) {
            const operation: dbOperation = JSON.parse(result.element)
            await executeOperation(operation)
        }
    } catch (error) {
        console.error('error in process db queue', error)
    }
}

let isProcessing = false

export const startDbQueueProcessor = () => {
    if (isProcessing) return

    isProcessing = true

    const processLoop = async () => {
        while (isProcessing) {
            await processDbQueue()
        }
    }

    processLoop()

    console.log('db process queue started')
}

export const stopDbQueueProcessor = () => {
    isProcessing = false
}

const executeOperation = async (operation: dbOperation) => {
    try {
        switch (operation.type) {
            case "CREATE_USER":
                await userService.createUser(operation.data)
                break

            case CREATE_GAME:
                await gameService.createGame(operation.data)
                break

            case MOVE_MADE:
                await moveService.createMove(operation.data)
                break
        }
    } catch (error) {
        console.error('error in execute operation', error)
    }
}