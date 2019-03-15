import Prismic from 'prismic-javascript';
import { getCacheManager } from '../cache/CacheManager';

const locales = JSON.parse(process.env.LOCALES);
class PrismicManager {
    constructor(apiEndpoint, accessToken) {
        this.apiEndpoint = apiEndpoint;
        this.accessToken = accessToken;
        this.api = null;
    }

    async init() {
        this.api = await Prismic.api(this.apiEndpoint, {
            accessToken: this.accessToken,
        });
    }

    async getInstance() {
        await this.init();
        return this;
    }

    async loadAllData(locales) {
        const cacheManager = await getCacheManager();
        for (let locale of Object.keys(locales)) {
            const types = {};
            const localeCode = locales[locale];
            const documents = await this.loadDocumentsForLocale(localeCode, 1, 100, '', []);
            for (const document of documents) {
                if (types[document.type]) {
                    types[document.type].push(document.id);
                } else {
                    types[document.type] = [document.id];
                }
                const processedDocument = await this.preprocessDocument(document, locale);
                await cacheManager._set(document.id, processedDocument, 'prismic', locale);
            }
            for (const type of Object.keys(types)) {
                await cacheManager._set(this.getCacheKeyForType(type), types[type], 'prismic', locale);
            }
        }
    }

    getCacheKeyForType(type) {
        return 'type_' + type;
    }

    loadDocumentsForLocale(locale, page = 1, resultsPerPage = 100, types = '', documents = []) {
        return this.query(locale, page, resultsPerPage, types).then(response => {
            if (response.next_page !== null) {
                return this.loadDocumentsForLocale(
                    locale,
                    page + 1,
                    resultsPerPage,
                    types,
                    documents.concat(response.results)
                );
            }
            return documents.concat(response.results);
        });
    }

    /**
     * Get one item by itemId and locale
     * @param itemId
     * @param locale
     * @returns {Promise<*>}
     */
    async get(itemId, locale) {
        const cacheManager = await getCacheManager();
        if (!(await cacheManager._has(itemId, 'prismic', locale))) {
            return null;
        }

        return await cacheManager._get(itemId, 'prismic', locale);
    }

    /**
     * Find items of a type and a locale
     * @param type
     * @param locale
     * @returns {Promise<*>}
     */
    async find(type, locale) {
        try {
            const cacheManager = await getCacheManager();
            let ids = await cacheManager._get(this.getCacheKeyForType(type), 'prismic', locale);
            if (ids === null) {
                await this.loadType(type, locale);
                ids = await cacheManager._get(this.getCacheKeyForType(type), 'prismic', locale);
            }
            let data = [];
            for (let id of ids) {
                data.push(await this.get(id, locale));
            }

            return data;
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Remove one item from cache
     * @param type
     * @param itemId
     * @param locale
     * @returns {Promise<void>}
     */
    async remove(type, itemId, locale) {
        const cacheManager = await getCacheManager();
        const ids = await cacheManager._get(this.getCacheKeyForType(type), 'prismic', locale);
        const index = ids.indexOf(itemId);

        await cacheManager._remove(itemId, 'prismic', locale);

        if (index !== -1) {
            ids.splice(index, 1);
            await cacheManager._set(this.getCacheKeyForType(type), ids, 'prismic', locale);
        }
    }

    async loadType(type, locale) {
        const cacheManager = await getCacheManager();
        const documents = await this.loadDocumentsForLocale(locale, 1, 100, type, []);

        for (let j = 0; j < documents.length; j++) {
            const document = documents[j];
            const processedDocument = await this.preprocessDocument(document, locale);
            await cacheManager._set(document.id, processedDocument, 'prismic', locale);
        }

        const ids = documents.map(item => item.id);
        await cacheManager._set(this.getCacheKeyForType(type), ids, 'prismic', locale);
    }

    async query(locale, page = 1, resultsPerPage = 100, types = '') {
        const lang = locales[locale] || locale;
        return await this.api.query(types, { lang: lang, page: page, pageSize: resultsPerPage });
    }

    async _formatData(data, locale = 'en') {
        if (data) {
            for (const field of Object.keys(data)) {
                const item = data[field];
                if (item && typeof item === 'object') {
                    if (Array.isArray(item)) {
                        const values = [];
                        for (const arrElement of item) {
                            const formattedElement = await this._formatData(arrElement, locale);
                            values.push(formattedElement);
                        }
                        data[field] = values;
                    } else if (item.id) {
                        const el = await this.get(data[field].id, locale);
                        if (el) {
                            data[field] = await this.preprocessDocument(el, locale);
                        }
                    }
                }
            }
        }

        return data;
    }

    async preprocessDocument(document, locale) {
        const data = await this._formatData(document.data || document, locale);
        return {
            id: document.id,
            uid: document.uid,
            type: document.type,
            slugs: document.slugs,
            ...data,
        };
    }
}

export async function getPrismicManager() {
    const prismic = new PrismicManager(process.env.PRISMIC_ENDPOINT, process.env.PRISMIC_ACCESS_TOKEN);
    return await prismic.getInstance();
}
