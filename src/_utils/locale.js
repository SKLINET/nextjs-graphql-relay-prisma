export const chooseRightLocale = (currentRoute, url, requestLocale = 'cs') => {
    if (currentRoute) {
        return currentRoute.locale;
    } else {
        let urlLocale = chooseRightLocaleFromUrl(url);
        return urlLocale ? urlLocale : requestLocale;
    }
};

export const chooseRightLocaleFromUrl = url => {
    const locales = process.env.LOCALES
        ? JSON.parse(process.env.LOCALES)
        : { cs: 'cz', en: 'en', sk: 'sk', pl: 'pl', de: 'de', ua: 'ua' };
    const regexp = new RegExp('^/(' + Object.keys(locales).join('|') + ')');
    let urlLocale = url.match(regexp);
    if (urlLocale) {
        return urlLocale[1];
    } else {
        return 'cs';
    }
};
