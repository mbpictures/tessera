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
    setupNodeEvents() {},
    specPattern: "cypress/component/**/*.test.{js,ts,jsx,tsx}",
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  env: {
    codeCoverage: {
      url: "http://localhost:3000/api/__coverage__"
    }
  }
});
