const Types = {
    Page: {
        url: page => {
            return page.url || '';
        },
    },
    ContentItem: {
        content: item => {
            const { id, uid, type, slugs, ...data } = item;
            return JSON.stringify(data);
        },
    },
};

export default Types;
