import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const { REDIS_URL } = process.env;

let redisClient = null;

function create() {
    return redis.createClient(REDIS_URL);
}

export const initRedis = () => {
    if (!redisClient) {
        redisClient = create();
    }

    return redisClient;
};
