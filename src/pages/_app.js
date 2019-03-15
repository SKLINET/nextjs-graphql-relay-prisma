import App, { Container } from 'next/app';
import NProgress from 'nprogress';
import routes, { Router } from '../routes';
import * as Sentry from '@sentry/browser';
import { compose } from 'recompose';
import withRoutes from '_hoc/withRoutes';
import withLocale from '_hoc/withLocale';
import { AppContext } from 'lib/framework/AppContext';
import { QueryRenderer, fetchQuery, graphql } from 'react-relay';
import { initEnvironment, createEnvironment } from 'lib/relay/createRelayEnvironment';
import React from 'react';

// const contentItemQuery = graphql`
//     query AppQuery($id: String, $locale: String) {
//         contentItem(id: $id, locale: $locale) {
//             id
//             type
//             content
//         }
//     }
// `;

class MyApp extends App {
    static async getInitialProps({ Component, router, ctx }) {
        let props = await super.getInitialProps({ Component, router, ctx });
        const componentProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};
        const variables = componentProps.variables || {};
        props.pageProps.queryParams = ctx.query;
        const data = { variables };
        try {
            let nextRoute = (ctx.req && ctx.req.nextRoute) || routes.match(ctx.asPath).route;
            props.pageProps.prismic = { page: {}, content: {} };
            let environment = null;
            if (process.browser) {
                environment = createEnvironment();
            } else {
                const { relaySSR, ...init } = initEnvironment();
                environment = init.environment;
                if (Component.query) {
                    await fetchQuery(environment, Component.query, variables);
                }
                data.relayData = await relaySSR.getCache();
            }

            if (nextRoute && nextRoute.data && nextRoute.data.contentItemId) {
                props.pageProps.prismic = {
                    page: nextRoute && nextRoute.data && nextRoute.data.page,
                    content:
                        nextRoute && nextRoute.data && nextRoute.data.contentItemId
                            ? {}
                            : // JSON.parse(
                              //       (await fetchQuery(environment, contentItemQuery, {
                              //           id: nextRoute.data.contentItemId,
                              //           locale: nextRoute.locale,
                              //       })).contentItem.content
                              //   )
                              {},
                };
            }
        } catch (e) {
            console.error(e);
        }

        return {
            ...props,
            ...data,
        };
    }

    constructor(props) {
        super(props);
        if (process.env.SENTRY_LOG === 'true' && process.env.SENTRY_URL) {
            Sentry.init({ dsn: process.env.SENTRY_URL });
        }

        this.state = {
            appContext: {
                locale: props.locale,
            },
        };
    }

    componentDidCatch(error, errorInfo) {
        if (process.env.SENTRY_LOG === 'true' && process.env.SENTRY_URL) {
            Sentry.configureScope(scope => {
                Object.keys(errorInfo).forEach(key => {
                    scope.setExtra(key, errorInfo[key]);
                });
            });
            Sentry.captureException(error);
        }

        // This is needed to render errors correctly in development / production
        super.componentDidCatch(error, errorInfo);
    }

    componentDidMount() {
        Router.onRouteChangeStart = () => NProgress.start();
        Router.onRouteChangeComplete = url => {
            NProgress.done();
            window.scroll({
                top: 0,
                left: 0,
            });
        };
        Router.onRouteChangeError = () => NProgress.done();
    }

    render() {
        const { Component, pageProps, locale, relayData, variables } = this.props;
        const environment = createEnvironment(
            relayData,
            JSON.stringify({
                queryID: Component.query ? Component.query().name : undefined,
                variables,
            })
        );

        return (
            <Container>
                <AppContext.Provider value={this.state.appContext}>
                    <QueryRenderer
                        environment={environment}
                        query={Component.query}
                        variables={variables}
                        render={({ error, props }) => {
                            if (error) {
                                return <div>{error.message}</div>;
                            } else if (
                                props &&
                                (Object.keys(props).length > 0 || !relayData || relayData.length === 0)
                            ) {
                                return (
                                    <Component
                                        key={`Component ${~~(Math.random() * 1e9)}`}
                                        {...pageProps}
                                        {...props}
                                        locale={locale}
                                    />
                                );
                            }
                            return <div />;
                        }}
                    />
                </AppContext.Provider>
            </Container>
        );
    }
}

export default compose(
    withLocale,
    withRoutes
)(MyApp);
