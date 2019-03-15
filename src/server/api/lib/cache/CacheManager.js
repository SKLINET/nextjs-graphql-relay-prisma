import RedisCacheAdapter from './RedisCacheAdapter';
import ObjectCacheAdapter from './ObjectCacheAdapter';
import { getPrismicManager } from '../prismic/PrismicManager';
import { setCrashState } from '../../middlewares/crashStateHandlerMiddleware';
import { initRedis } from './initRedis';

const locales = process.env.LOCALES ? JSON.parse(process.env.LOCALES) : ['cs', 'en', 'sk', 'pl', 'de', 'ua'];
let cacheManager;
let promise = null;

async function getRedisClient() {
    if (promise) {
        return promise;
    }

    promise = new Promise((resolve, reject) => {
        const redisClient = initRedis();

        redisClient.on('error', function(err) {
            console.error(err);
            setCrashState();
            reject();
        });

        redisClient.on('ready', function() {
            resolve(redisClient);
        });
    });

    return promise;
}

export async function prefetchData(type = null) {
    if (type) {
        switch (type) {
            case 'prismic':
                console.log('Prefetch prismic');
                const prismicManager = await getPrismicManager();
                await prismicManager.loadAllData(locales);
                break;
        }
    } else {
        await prefetchData('prismic');
    }
}

export const initCacheManager = async () => {
    if (process.env.REDIS_URL) {
        const oldCacheManager = cacheManager;
        try {
            console.log('Trying REDIS cache adapter');
            const redis = await getRedisClient();
            cacheManager = new RedisCacheAdapter(redis);
            console.info('Using REDIS cache adapter');
        } catch (e) {
            if (oldCacheManager) {
                cacheManager = oldCacheManager;
            } else {
                console.warn('Redis not running, switching to object cache');
                cacheManager = new ObjectCacheAdapter();
                console.info('Using Object cache adapter');
            }
        }
    } else {
        cacheManager = new ObjectCacheAdapter();
        console.info('Using Object cache adapter');
    }
};

export const getCacheManager = async () => {
    if (!cacheManager) {
        await initCacheManager();
    }
    return new Promise(resolve => {
        const checkCacheManagerAndResolve = () => {
            if (cacheManager) {
                resolve(cacheManager);
            } else {
                setTimeout(checkCacheManagerAndResolve, 1000);
            }
        };

        checkCacheManagerAndResolve();
    });
};

export const clearCache = async origin => {
    if (cacheManager) {
        cacheManager._clear(origin);
    }
};
