import { GraphQLServer } from 'graphql-yoga';
import { Prisma } from 'prisma-binding';
import resolvers from './resolvers';
import { crashStateHandler } from './middlewares/crashStateHandlerMiddleware';
import { initCacheManager, prefetchData } from './lib/cache/CacheManager';
import controllers from './controllers';
import bodyParser from 'body-parser';

const db = new Prisma({
    typeDefs: 'database/__generated__/schema.graphql', // the auto-generated GraphQL schema of the Prisma API
    endpoint: process.env.PRISMA_ENDPOINT, // the endpoint of the Prisma API (value set in `.env`)
    debug: process.env.EXTENDED_LOG === 'true', // log all GraphQL queries & mutations sent to the Prisma API
    secret: process.env.PRISMA_SECRET, // only needed if specified in `database/prisma.yml` (value set in `.env`)
});

const server = new GraphQLServer({
    typeDefs: './src/server/api/model.graphql',
    resolvers,
    resolverValidationOptions: {
        // https://github.com/prismagraphql/prisma/issues/2225#issuecomment-384697669
        requireResolversForResolveType: false,
    },
    context: req => ({ ...req, db }),
});

try {
    initCacheManager()
        .then(() => prefetchData('prismic'))
        .then(() => {
            crashStateHandler(server);
            server.use(bodyParser.json());
            server.use(bodyParser.urlencoded({ extended: false }));
            server.use('/', controllers);
            server.start(
                {
                    port: process.env.API_PORT,
                },
                () => {
                    console.log(`API is running on ${process.env.API_ENDPOINT || ''}`);
                }
            );
        });
} catch (e) {
    console.log(e);
}
