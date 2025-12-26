
import { GameManager, LiveGame } from "../gameEngine/gameManager"
import { subscriberClient } from "../redis"
import { User } from "../gameEngine/User"
import { LIVE_GAME, LIVE_GAME_UPDATES, LIVE_GAMES_LIST } from "./message"
import { gamePayload } from "./helper"

interface subOperations {
    liveGames: LiveGame[],
    viewers: User[]
}

export const startSubscribers = async (gameManager: GameManager) => {

    if (!subscriberClient.isOpen) {
        throw new Error('redis not connected')
    }

    await subscriberClient.subscribe(LIVE_GAMES_LIST, (message) => {
        console.log('subscribing to channel : ', LIVE_GAMES_LIST)

        try {
            const data: subOperations = JSON.parse(message)

            //* send message to all the active viewers 
            gameManager.getGameListWatchers().forEach((viewer: User) => {
                viewer.socket.send(JSON.stringify({
                    type: LIVE_GAMES_LIST,
                    payload: data.liveGames
                }))
            })
        } catch (error) {
            console.log('error subscribing to channel : ', LIVE_GAMES_LIST)
            console.error("error : ", error)
        }
    })

    await subscriberClient.subscribe(LIVE_GAME, (message) => {
        console.log('subscribing to channel : ', LIVE_GAME)

        try {
            const data = JSON.parse(message)

            console.log('move published. sending to spectators')

            gameManager.getGameWatchers().forEach(user => {
                if (!user.gameId) {
                    throw new Error("gameId not fiund in user")
                }

                const game = gameManager.getGamesMap().get(user.gameId)

                if (!game) {
                    throw new Error("game not found")
                }

                const payload = gamePayload(game)

                console.log('active speactators ', user.id)
                user.socket.send(JSON.stringify({
                    type: LIVE_GAME_UPDATES,
                    payload: payload
                }))
            })

        } catch (error) {
            console.error('error in game subscriber')
        }
    })

}