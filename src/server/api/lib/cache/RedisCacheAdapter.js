import CacheAdaptee from './CacheAdaptee.js';

export default class RedisCacheAdapter extends CacheAdaptee {
    constructor(client) {
        super();
        this.storage = client;
    }

    async _get(key, origin, locale, defaultValue = null) {
        const composedKey = `origin:${origin};locale:${locale};key:${key}`;
        try {
            return new Promise((resolve, reject) => {
                this.storage.get(composedKey, (err, reply) => {
                    if (err) {
                        console.log(err);
                    }
                    try {
                        const value = reply === null ? defaultValue : JSON.parse(reply);
                        resolve(value);
                    } catch (e) {
                        resolve(defaultValue);
                    }
                });
            });
        } catch (e) {
            console.log(e);
            return defaultValue;
        }
    }

    async _has(key, origin, locale) {
        const composedKey = `origin:${origin};locale:${locale};key:${key}`;
        return this.storage.exists(composedKey);
    }

    async _set(key, value, origin, locale, lifetime = 0) {
        const composedKey = `origin:${origin};locale:${locale};key:${key}`;
        if (lifetime > 0) {
            this.storage.set(composedKey, JSON.stringify(value), 'EX', lifetime);
        } else {
            this.storage.set(composedKey, JSON.stringify(value));
        }
        return value;
    }

    async _remove(key, origin, locale = '*') {
        const composedKey = `origin:${origin};locale:${locale};key:${key}`;
        const keys = await new Promise((resolve, reject) => {
            this.storage.keys(composedKey, (err, reply) => {
                if (err) {
                    console.log(err);
                }
                resolve(reply);
            });
        });

        if (keys.length > 0) {
            this.storage.del(keys);
            return true;
        }

        return false;
    }

    async _clear(origin) {
        await this._remove('*', origin);
    }

    getStorageType() {
        return 'redis';
    }
}
