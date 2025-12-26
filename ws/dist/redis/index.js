"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopRedis = exports.connectRedis = exports.publisherClient = exports.subscriberClient = exports.client = void 0;
const redis_1 = require("redis");
require("dotenv/config");
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const getRedisConfig = () => {
    if (!REDIS_PASSWORD) {
        throw new Error("Redis configuration missing: Provide REDIS_HOST and REDIS_PASSWORD");
    }
    return {
        url: `redis://:${REDIS_PASSWORD}@redis-12075.crce263.ap-south-1-1.ec2.cloud.redislabs.com:12075`
    };
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
};
const redisConfig = getRedisConfig();
exports.client = (0, redis_1.createClient)(redisConfig);
exports.subscriberClient = (0, redis_1.createClient)(redisConfig);
exports.publisherClient = (0, redis_1.createClient)(redisConfig);
exports.client.on('error', (error) => {
    console.error('Redis client error:', error);
});
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.client.connect();
    yield exports.subscriberClient.connect();
    yield exports.publisherClient.connect();
});
exports.connectRedis = connectRedis;
const stopRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.client.quit();
    yield exports.subscriberClient.quit();
    yield exports.publisherClient.quit();
});
exports.stopRedis = stopRedis;
