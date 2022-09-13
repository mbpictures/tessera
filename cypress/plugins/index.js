/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const codeCoverageTask = require('@cypress/code-coverage/task')
const ms = require('smtp-tester')
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
    let lastEmail = {};
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
    on("task", {
        "db:teardown": async () => {
            const main = require("../../prisma/teardown").main;
            await main()
            return null
        },
        "db:seed": async () => {
            const {main} = require("../../prisma/seed");
            await main();
            return null
        },
        "setAdminToken": (adminToken) => {
            global.adminToken = adminToken;
            return null;
        },
        "getAdminToken": () => {
            return global.adminToken;
        },
        "getLastEmail": (email) => {
            return lastEmail[email] || null
        },
        "resetEmails": (email) => {
            if (email) {
                delete lastEmail[email]
            } else {
                lastEmail = {}
            }
            return null
        },
    })

    codeCoverageTask(on, config);

    const mailServer = ms.init(7777)
    mailServer.bind((addr, id, email) => {
        lastEmail[email.headers.to] = {
            body: email.body,
            html: email.html,
        };
    });

    return config;
}
