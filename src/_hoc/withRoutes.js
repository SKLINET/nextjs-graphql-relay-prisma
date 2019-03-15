import React, { Component } from 'react';
import routes from 'routes';
import PropTypes from 'prop-types';

const withRoutes = App => {
    return class WithRoutesComponent extends Component {
        static displayName = `WithRoutes(${App.displayName})`;

        static propTypes = {
            routes: PropTypes.array,
        };

        static async getInitialProps({ Component, router, ctx }) {
            let appProps = {};
            // load routes during ssr
            if (!process.browser) {
                await routes.load();
            }

            routes.setLocale(ctx.locale);
            ctx.routes = routes.routes;

            if (App.getInitialProps) {
                appProps = await App.getInitialProps({ Component, router, ctx });
            }

            return {
                routes: routes.routes.filter(r => r.locale === ctx.locale),
                ...appProps,
            };
        }

        constructor(props) {
            super(props);
            if (!props) {
                console.log('nejsou props');
            }

            if (props.locale !== undefined) {
                routes.setLocale(props.locale);
                if (routes.routes.length === 0) {
                    if (props && props.routes) {
                        routes.loadRoutes(props.routes, props.locale);
                    } else if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
                        routes.loadRoutes(window.__NEXT_DATA__.props.routes, props.locale);
                    }
                }
            }
        }

        render() {
            return <App {...this.props} />;
        }
    };
};

export default withRoutes;
