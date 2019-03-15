import { fetchData } from './lib/fetch/fetch';
const routes = (module.exports = require('@sklinet/next-routes-with-locale')({ locale: 'en' }));

const pagesQuery = `
    query pagesQuery($locale: String) {
        pages(locale: $locale) {
            id
            uid
            type
            title {
              type
              text
            }
            menu_title
            description
            url
            content_item{
                id
                uid
                type
                content
            }
            child_pages {
              id
              uid
              url
              title {
                type
                text
              }
              menu_title
              description
            }

        }
    }
`;

let loadPromise = undefined;
routes.load = async function(force = false) {
    const locales = Object.keys(JSON.parse(process.env.LOCALES));
    if (force || loadPromise === undefined) {
        loadPromise = new Promise(async (resolve, reject) => {
            const tmpRoutes = require('@sklinet/next-routes-with-locale')({ locale: 'en' });

            try {
                for (const locale of locales) {
                    console.log('loading routes for ' + locale);
                    const queryResult = await fetchData(pagesQuery, { locale: locale });
                    const data = queryResult.data;
                    const pagesByCodename = {};
                    tmpRoutes.pagesById = {};

                    if (!Array.isArray(data.pages) || data.pages.length <= 0) {
                        console.error('No pages for locale ' + locale + '!!!');
                        continue;
                    }

                    data.pages.forEach(page => {
                        pagesByCodename[page.uid] = { ...page };
                        tmpRoutes.pagesById[page.id] = page.uid;
                    });

                    let page = pagesByCodename[`homepage_${locale}`];

                    page = removeTypename(page);
                    page.parent = null;
                    if (page.content_item) {
                        try {
                            tmpRoutes.add('homepage', locale, '/', 'homepage', {
                                page: page,
                                contentItem: page.content_item.uid,
                                contentItemId: page.content_item.id,
                                level: 0,
                            });
                        } catch (exception) {
                            console.log(exception);
                        }
                    }
                    addChildRoutes(tmpRoutes, pagesByCodename, page, locale, 1);
                }

                // ADD CUSTOM STATIC ROUTES HERE
                for (const locale of locales) {
                    //tmpRoutes.add('500', locale, '/500', '500');
                }
                tmpRoutes.add('edit-bot', 'en', '/edit', 'edit-bot');
                tmpRoutes.add('avatar-add', 'en', '/add-avatar', 'add-avatar');
                tmpRoutes.add('avatar-list', 'en', '/avatar-list', 'avatar-list');
                tmpRoutes.add('create-tree', 'en', '/create-tree', 'create-tree');
                tmpRoutes.add('edit-tree', 'en', '/tree', 'tree');
                tmpRoutes.add('tree-list', 'en', '/tree-list', 'tree-list');
                tmpRoutes.add('assets', 'en', '/assets', 'assets');

                // tmpRoutes.routes.forEach(r => console.log(r));

                routes.routes = tmpRoutes.routes;
                routes.pagesById = tmpRoutes.pagesById;
                resolve(routes);
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    return loadPromise;
};

let loaded = false;
routes.loadRoutes = function(routesArr) {
    if (!loaded) {
        routes.setRoutes([...routesArr]);
        loaded = true;
    }
};

function addChildRoutes(tmpRoutes, pagesByCodename, page, locale, level) {
    if (page.child_pages) {
        page.child_pages.forEach(({ uid }) => {
            const childPage = pagesByCodename[uid];

            if (childPage) {
                childPage.parent = page.uid;

                // update URL slugs to full URLs

                if (childPage.content_item && childPage.url) {
                    childPage.url = page.url + '/' + childPage.url;

                    // convert kentico template type to next page
                    const pageName = childPage.content_item.type.replace(/template_/, '').replace(/_+/g, '-');
                    // add route
                    try {
                        tmpRoutes.add(
                            childPage.uid.replace(new RegExp('_' + locale), ''),
                            locale,
                            childPage.url,
                            pageName,
                            {
                                page: childPage,
                                contentItem: childPage.content_item.uid,
                                contentItemId: childPage.content_item.id,
                                level: level,
                            }
                        );
                    } catch (e) {
                        console.log("Can't add route: " + e.message);
                    }
                } else if (childPage.url) {
                    childPage.url = page.url + '/' + childPage.url;
                } else {
                    childPage.url = page.url;
                }
                addChildRoutes(tmpRoutes, pagesByCodename, childPage, locale, level + 1);
            }
        });
    }
}

function removeTypename(obj) {
    return JSON.parse(JSON.stringify(obj).replace(/,?"__typename":"[^"]*?",?/g, ''));
}

export default routes;
