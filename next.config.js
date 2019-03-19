const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { WebpackBundleSizeAnalyzerPlugin } = require('webpack-bundle-size-analyzer');
const Visualizer = require('webpack-visualizer-plugin');
const withTypescript = require('@zeit/next-typescript');

const { ANALYZE } = process.env;

module.exports = withTypescript({
    webpack(config, { isServer }) {
        switch (ANALYZE) {
            case 'BUNDLES':
                config.plugins.push(
                    new BundleAnalyzerPlugin({
                        analyzerMode: 'server',
                        analyzerPort: isServer ? 8888 : 8889,
                        openAnalyzer: true,
                    })
                );
                break;
            case 'SIZE':
                config.plugins.push(new WebpackBundleSizeAnalyzerPlugin('stats.txt'));
                break;
            case 'VISUALIZE':
                config.plugins.push(new Visualizer());
                break;
        }

        // eslint-disable-next-line no-param-reassign
        config.resolve = {
            ...config.resolve,
            extensions: ['.js', '.json'],
        };

        return config;
    },
});
