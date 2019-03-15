import CacheAdaptee from './CacheAdaptee.js';

export default class ObjectCacheAdapter extends CacheAdaptee {
    constructor() {
        super();
        this.storage = {};
    }

    async _has(key, origin, locale) {
        return (
            this.storage[origin] !== undefined &&
            this.storage[origin][key] !== undefined &&
            typeof this.storage[origin][key][locale] === 'object'
        );
    }

    async _get(key, origin, locale, defaultValue = null) {
        return (await this._has(key, origin, locale)) ? this.storage[origin][key][locale].data : defaultValue;
    }

    async _set(key, value, origin, locale, lifetime = 0) {
        if (this.storage[origin] === undefined) {
            this.storage[origin] = {};
        }

        if (this.storage[origin][key] === undefined) {
            this.storage[origin][key] = {};
        }

        const timestamp = Math.floor(Date.now() / 1000);
        this.storage[origin][key][locale] = { data: value, lifetime: lifetime, created_at: timestamp };

        return this.storage[origin][key][locale].data;
    }

    async _remove(key, origin, locale = '*') {
        if (locale === '*') {
            this.storage[origin] && this.storage[origin][key] && delete this.storage[origin][key];
        } else {
            this.storage[origin] &&
                this.storage[origin][key] &&
                this.storage[origin][key][locale] &&
                delete this.storage[origin][key][locale];
        }
    }

    async _clear(origin) {
        this.storage[origin] = {};
    }

    getStorageType() {
        return 'object';
    }
}
