import i18nConfig from "../../../../i18n";

describe("Translation Management", () => {
    const namespaces = Object.values(i18nConfig.pages)
        .flat()
        .filter((val, index, array) => array.indexOf(val) === index);

    before(() => {
        cy.task("db:teardown", null, {timeout: 60000});
        cy.registerInitialAdminUser();
    })

    it("Default Translations", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/localization");

            cy.wrap(namespaces).each((namespace) => {
                cy.get("#namespace-" + namespace).should("exist");
            });

            cy.wrap(namespaces).each((namespace) => {
                cy.wrap(i18nConfig.locales).each((locale) => {
                    cy.getTranslation(namespace, locale).then((translation) => {
                        cy.wrap(Object.keys(translation)).each((key) => {
                            cy.get(`#translation-${namespace}-${locale}-${key}`).should("have.value", translation[key]);
                        });
                    });
                });
            });
        });
    });

    it("Change Translation", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/localization");
            const namespace = namespaces[Math.floor(Math.random() * namespaces.length)];
            let translationExpectations = {};

            cy.get("#namespace-" + namespace).click();

            cy.wrap(i18nConfig.locales).each((locale) => {
                cy.getTranslation(namespace, locale).then((translation) => {
                    const keys = Object.keys(translation);
                    const key = keys[Math.floor(Math.random() * keys.length)];
                    const newTranslation = translation[key] + "_changed" + locale;

                    translationExpectations[locale] = [key, newTranslation];
                    cy.get(`#translation-${namespace}-${locale}-${key}`).clear().type(newTranslation);
                });
            });

            cy.get("#localization-save").click();
            cy.visit("/admin/localization");

            cy.wrap(Object.entries(translationExpectations)).each((expectations) => {
                cy.getTranslation(namespace, expectations[0]).then((translation) => {
                    expect(translation[expectations[1][0]]).to.equal(expectations[1][1]);
                });
            });
        });
    });
})

Cypress.Commands.add("getTranslation", (namespace, locale) => {
    cy.request(`/api/translation/${namespace}/${locale}`).then(({body}) => body);
});
