import express from 'express';
import bodyParser from 'body-parser';
import next from 'next';
import requestIp from 'request-ip';
import loggingMiddleware from './middlewares/loggingMiddleware';
import { basicAuthHandlerHandler } from './middlewares/basicAuthMiddleware';
import routes from '../../routes';
import locale from 'locale';
import helmet from 'helmet';
import controllers from './controllers';
import serveStatic from 'serve-static';
import * as Sentry from '@sentry/node';
import path from 'path';

const locales = Object.keys(JSON.parse(process.env.LOCALES));
const { NODE_ENV, PORT, SECURE_AREA, SENTRY_LOG, SENTRY_URL, EXTENDED_LOG } = process.env;
const dev = NODE_ENV !== 'production';
const app = next({ dev, dir: './src' });
if (SENTRY_LOG === 'true' && SENTRY_URL) {
    Sentry.init({ dsn: SENTRY_URL });
}

try {
    app.prepare()
        .then(() => {
            const server = express();
            if (SENTRY_LOG === 'true' && SENTRY_URL) {
                server.use(Sentry.Handlers.requestHandler());
                server.use(Sentry.Handlers.errorHandler());
            }

            server.use(requestIp.mw());
            if (EXTENDED_LOG === 'true') {
                server.use(loggingMiddleware);
            }
            server.use(locale(locales, locales[0]));
            server.use(bodyParser.json());
            server.use(bodyParser.urlencoded({ extended: false }));
            if (SECURE_AREA === 'true') {
                basicAuthHandlerHandler(server);
            }
            server.use(helmet());
            server.set('trust proxy', 1);
            server.use('/', controllers);
            server.use(
                '/static',
                serveStatic(path.join(path.resolve('./'), 'static'), {
                    setHeaders: (res, path) => {
                        res.setHeader('Cache-Control', 'public,max-age=31536000,immutable');
                    },
                })
            );

            routes.load().then(() => {
                server.use(routes.getRequestHandler(app));
            });
            server.listen(PORT, err => {
                if (err) throw err;
                if (dev) console.info(`> Web is running on http://localhost:${PORT}`);
            });
        })
        .catch(function(e) {
            console.error("Can't load routes (" + e.message + '). Exiting...');
        });
} catch (e) {
    console.log(e);
}
