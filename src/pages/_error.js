import React, { Fragment } from 'react';
import ErrorPage from 'next/error';

let Sentry = null;
if (!process.browser && process.env.SENTRY_LOG === 'true' && process.env.SENTRY_URL) {
    Sentry = require('@sentry/node');
}

class MyErrorPage extends ErrorPage {
    static async getInitialProps({ res, req, err }) {
        let statusCode = res ? res.statusCode : err ? err.statusCode : null;
        if (statusCode >= 500 && !process.browser && process.env.SENTRY_LOG === 'true' && process.env.SENTRY_URL) {
            Sentry.captureException(err);
        }
        return { statusCode, err };
    }
    render() {
        return (
            <Fragment>
                {this.props.statusCode
                    ? `An error ${this.props.statusCode} occurred on server`
                    : 'An error occurred on client'}
            </Fragment>
        );
    }
}

export default MyErrorPage;
