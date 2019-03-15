import { initCacheManager } from '../lib/cache/CacheManager';

let crashState = false;

export const setCrashState = () => {
    crashState = true;
};

export const crashStateHandler = app => {
    let status = 503,
        message = 'SERVER ERROR',
        view = 'errorPage.html';

    const handle = function(req, res) {
        res.status(status);
        //TODO: when error page will be ready, switch response return
        //return res.render(view);

        res.setHeader('content-type', 'application/json');
        return res.send({ message: message });
    };

    const middleware = async function(req, res, next) {
        if (crashState) {
            await initCacheManager();
            crashState = false;
        }

        next();
    };

    const inject = function(app) {
        app.use(middleware);
        return app;
    };

    return inject(app);
};
