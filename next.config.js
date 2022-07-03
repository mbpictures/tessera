const CopyPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { i18n } = require('./next-i18next.config');

module.exports = {
    i18n,
    future: {
        webpack5: true
    },
    webpack: function (config, { dev, isServer }) {
        // Fixes npm packages that depend on `fs` module
        if (!isServer) {
            config.resolve.fallback.fs = false
        }
        // copy files you're interested in
        if (!dev) {
            config.plugins.push(
                new CopyPlugin({
                    patterns: [{ from: "src/assets", to: "assets" }]
                })
            )
        }

        if (process.env.ANALYZE) {
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: "server",
                    analyzerPort: isServer ? 8888 : 8889,
                    openAnalyzer: true
                })
            );
        }

        return config
    },
    output: "standalone"
};
