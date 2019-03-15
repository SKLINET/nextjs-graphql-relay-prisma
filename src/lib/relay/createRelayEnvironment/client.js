import { RelayNetworkLayer, cacheMiddleware, urlMiddleware } from 'react-relay-network-modern/node8';
import RelaySSR from 'react-relay-network-modern-ssr/node8/client';
import { Environment, RecordSource, Store } from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const source = new RecordSource();
const store = new Store(source);

let storeEnvironment = null;

const setupSubscription = (config, variables, cacheConfig, observer) => {
    const query = config.text;
    const subscriptionClient = new SubscriptionClient('ws://localhost:4000', { reconnect: true });
    subscriptionClient.subscribe({ query, variables }, (error, result) => {
        observer.onNext({ data: result });
    });
};

export default {
    createEnvironment: relayData => {
        if (storeEnvironment) {
            return storeEnvironment;
        }

        storeEnvironment = new Environment({
            store,
            network: new RelayNetworkLayer(
                [
                    cacheMiddleware({
                        size: 100,
                        ttl: 60 * 1000,
                    }),
                    new RelaySSR(relayData).getMiddleware({
                        lookup: false,
                    }),
                    urlMiddleware({
                        url: req => process.env.API_ENDPOINT,
                    }),
                ],
                {
                    subscribeFn: setupSubscription,
                }
            ),
        });

        return storeEnvironment;
    },
};
