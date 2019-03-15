import { getPrismicManager } from '../lib/prismic/PrismicManager';
const Query = {
    allUsers: async (_, args, context, info) => {
        return context.db.query.users({}, info);
    },
    pages: async (args, { locale = 'en' }) => {
        const prismicManager = await getPrismicManager();
        const pages = await prismicManager.find('page', locale);
        return pages.map(page => ({ ...page, child_pages: page.child_pages.map(childPage => childPage.page) }));
    },
    contentItem: async (args, { uid = null, id = null, locale = 'en' }) => {
        const prismicManager = await getPrismicManager();
        return await prismicManager.get(id || uid, locale);
    },
};

export default Query;
