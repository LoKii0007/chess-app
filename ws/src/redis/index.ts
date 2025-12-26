import { createClient } from "redis";
require("dotenv/config")

const REDIS_PASSWORD = process.env.REDIS_PASSWORD

const getRedisConfig = () => {

    if (!REDIS_PASSWORD) {
        throw new Error("Redis configuration missing: Provide REDIS_HOST and REDIS_PASSWORD")
    }


    return {
        url: `redis://:${REDIS_PASSWORD}@redis-12075.crce263.ap-south-1-1.ec2.cloud.redislabs.com:12075`
    }


    // return {
    //     password: REDIS_PASSWORD,
    //     socket: {
    //         host: REDIS_HOST,
    //         port: REDIS_PORT,
    //         tls: true as const, // Redis Cloud requires TLS
    //         reconnectStrategy: (retries: number) => {
    //             if (retries > 10) {
    //                 return new Error('Too many reconnection attempts');
    //             }
    //             return Math.min(retries * 100, 3000);
    //         }
    //     }
    // }
}

const redisConfig = getRedisConfig()

export const client = createClient(redisConfig)

export const subscriberClient = createClient(redisConfig)

export const publisherClient = createClient(redisConfig)

client.on('error', (error) => {
    console.error('Redis client error:', error)
})

export const connectRedis = async () => {
    await client.connect()
    await subscriberClient.connect()
    await publisherClient.connect()
}

export const stopRedis = async () => {
    await client.quit()
    await subscriberClient.quit()
    await publisherClient.quit()
}