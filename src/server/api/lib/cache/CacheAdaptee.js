export default class CacheAdaptee {
    constructor() {}
    async _get(key, origin, locale, defaultValue = null) {}
    async _has(key, origin, locale) {}
    async _set(key, value, origin, locale, lifetime = 0) {}
    async _remove(key, origin, locale = '*') {}
    async _clear(origin) {}

    getStorageType() {}
}
