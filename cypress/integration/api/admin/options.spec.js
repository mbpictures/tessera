describe("Configuration in admin dashboard", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 60000});
        cy.registerInitialAdminUser();
    });

    it("Title/Subtitle", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/options");

            cy.get("#accordion-general").click();
            cy.get("#shop-title-input").clear().type("Test Title");
            cy.get("#general-save").click();

            cy.visit("/admin/options");

            cy.request({
                method: "GET",
                url: "api/admin/options",
                body: {
                    key: "shop.title"
                }
            }).then(({body}) => {
                expect(body.value).to.equal("Test Title");

                cy.get("#accordion-general").click();
                cy.get("#shop-subtitle-input").clear().type("Test Subtitle");
                cy.get("#general-save").click();

                cy.visit("/admin/options");
                cy.request({
                    method: "GET",
                    url: "api/admin/options",
                    body: {
                        key: "shop.subtitle"
                    }
                }).then(({body}) => {
                    expect(body.value).to.equal("Test Subtitle");
                });
            });
        });
    });

    it("Payment Methods", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");

            const paymentProviders = ["creditcard", "stripeiban", "sofort"];

            cy.visit("/admin/options");
            cy.get("#accordion-payment").click();
            cy.get("#accordion-payment-details input[type=checkbox]").each((elem, index) => {
                if (index >= paymentProviders.length) {
                    cy.wrap(elem).uncheck({force: true});
                    return;
                }
                cy.wrap(elem).check({force: true});
            });
            cy.get("#payment-save").click();
            cy.visit("/admin/options");

            cy.request({
                method: "GET",
                url: "api/admin/options",
                body: {
                    key: "shop.payment-provider"
                }
            }).then(({body}) => {
                expect(body.value).to.deep.equal(paymentProviders);
            });
        });
    });

    it("Delivery Methods", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");

            const deliveryProviders = ["post", "download"];

            cy.visit("/admin/options");
            cy.get("#accordion-delivery").click();
            cy.get("#accordion-delivery-details input[type=checkbox]").each((elem, index) => {
                if (index >= deliveryProviders.length) {
                    cy.wrap(elem).uncheck({force: true});
                    return;
                }
                cy.wrap(elem).check({force: true});
            });
            cy.get("#delivery-save").click();
            cy.visit("/admin/options");

            cy.request({
                method: "GET",
                url: "api/admin/options",
                body: {
                    key: "shop.delivery"
                }
            }).then(({body}) => {
                expect(body.value).to.deep.equal(deliveryProviders);
            });
        });
    });
});
