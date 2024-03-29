import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 16000,
  pageLoadTimeout: 60000,
  projectId: "5z1jcc",
  chromeWebSecurity: false,
  video: false,

  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.spec.{js,ts,jsx,tsx}",
  },

  component: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    specPattern: "cypress/component/**/*.test.{js,ts,jsx,tsx}",
    devServer: {
      framework: "next",
      bundler: "webpack",
      webpackConfig: {
        mode: 'development',
        devtool: false,
        module: {
          rules: [
            {
              test: /\.(ts|tsx)$/,
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['next/babel'],
                  plugins: ['istanbul',],
                },
              },
            },
          ],
        },
      }
    },
  },

  env: {
    codeCoverage: {
      url: "http://localhost:3000/api/__coverage__"
    }
  }
});
