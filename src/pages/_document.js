import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import Global from '_utils/global-styles';
import React from 'react';

export default class MyDocument extends Document {
    static async getInitialProps(args) {
        const documentProps = await super.getInitialProps(args);
        const sheet = new ServerStyleSheet();
        const page = args.renderPage(App => props => sheet.collectStyles(<App {...props} />));
        const styleTags = sheet.getStyleElement();
        return { ...documentProps, ...page, styleTags };
    }

    render() {
        return (
            <html>
                <Head>
                    <Global />
                    {this.props.styleTags}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
