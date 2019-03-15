import React, { Component } from 'react';
import routes from 'routes';
import { chooseRightLocaleFromUrl } from '_utils/locale';

export default App => {
    return class Locale extends Component {
        static displayName = `WithLocale(${App.displayName})`;

        static async getInitialProps({ Component, router, ctx }) {
            let appProps = {};
            let locale = null;

            const nextRoute = (ctx.req && ctx.req.nextRoute) || routes.match(ctx.asPath).route;
            if (nextRoute) {
                if (!ctx.locale) {
                    locale = nextRoute.locale;
                    ctx.locale = locale;
                } else {
                    locale = ctx.locale;
                }
            } else {
                if (!ctx.locale) {
                    locale = chooseRightLocaleFromUrl(ctx.req.url);
                    ctx.locale = locale;
                } else {
                    locale = ctx.locale;
                }
            }

            if (App.getInitialProps) {
                appProps = await App.getInitialProps({ Component, router, ctx });
            }

            return {
                ...appProps,
                locale,
            };
        }

        constructor(props) {
            super(props);
            this.locale = props.locale || window.__NEXT_DATA__.props.locale;
        }

        render() {
            return <App {...this.props} locale={this.locale} />;
        }
    };
};
