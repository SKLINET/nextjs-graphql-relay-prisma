# NGRP devstack 
(Next.js + GraphQL + Relay + Prisma)

### Prerequisites

- [node.js](http://nodejs.org/) Node 10+
- [yarn](https://yarnpkg.com/en/)

### Used Technologies
- [Next.js](https://github.com/zeit/next.js)
- [Prisma](https://github.com/prisma/prisma)
- [Relay Modern](https://github.com/facebook/relay)
- [GraphQL Yoga](https://github.com/prisma/graphql-yoga)

### Setup project

- `git clone git@github.com:SKLINET/nextjs-graphql-relay-prisma.git`
- `cd bot-factory`
- `yarn`
- `copy and rename .env.default -> to .env`

### Setup Prisma server with Docker Compose _[requires docker-compose]_

- `yarn docker:up` - this will spin up a docker instance of Postgres and Prisma server at http://localhost:4466
- `yarn docker:down` - stop docker-compose servers

### Prisma tasks

- `yarn prisma help` - prisma help command
- `yarn prisma seed` - seed service with initial data
- `yarn prisma seed --reset` - reset seed
- `yarn prisma reset` - delete all service data 

### Deploy dev Prisma
- `yarn deploy:db`
- `yarn prisma token` - generate token
- `yarn dev:playground` - Set database HTTP HEADERS to { "Authorization": "Bearer token" }

### Development
- `yarn dev` - run all tasks below
- `yarn dev:web` - start web development
- `yarn dev:api` - start API (GraphQL server) development
- `yarn dev:playground` - start GraphQL playground
- `yarn dev:relay:watch` - start relay compiler and watch for changes

### Production
- `yarn production` - run all tasks below
- `yarn production:web` - test production build of web locally
- `yarn production:api` - test production build of api locally

### Build
- `yarn run build` - next build task

### Test
- `yarn test` - run tests
- `yarn test:watch` - run tests and watch for changes

### Analyze
- `yarn analyze:bundles` - visualize size of webpack output files with an interactive zoomable treemap
- `yarn analyze:size` - help you find out what is contributing to the size of your Webpack bundles.

### StoryBook
Stories are loaded from files in "src" directory with **.stories.js** extension
- `yarn storybook`
