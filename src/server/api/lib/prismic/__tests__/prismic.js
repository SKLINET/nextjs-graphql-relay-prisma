import { getPrismicManager } from '../PrismicManager';

test('prismic', async () => {
    const prismicManager = await getPrismicManager();
    const locales = JSON.parse(process.env.LOCALES);
    console.log(await prismicManager.loadAllData(locales));
});

test('formatData', async () => {
    const prismicManager = await getPrismicManager();
    const data = {
        id: 'id',
        uid: 'uid',
        type: 'type',
        slugs: ['aa'],
        data: {
            title: [{ type: 'heading', text: 'Dashboard' }],
            menu_title: 'Dashboard',
            description: 'test en 5',
            url_slug: 'dashboard',
            page: {
                id: 'XAapphMAAImBcXdM',
                type: 'page',
                tags: [],
                slug: 'dashboard',
                lang: 'en-us',
                link_type: 'Document',
                isBroken: false,
            },
        },
    };

    console.log(await prismicManager.preprocessDocument(data, 'en'));
});
