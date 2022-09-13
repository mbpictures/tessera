import { faker } from "@faker-js/faker";

describe("Admin Configuration on store page", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 60000});
        cy.registerInitialAdminUser();
        cy.createToken();
        cy.createEvents();
    });

    it("Title/Subtitle", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "POST",
                    url: "api/admin/options",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        key: "shop.title",
                        value: "Test Title",
                    }
                }).then(() => {
                    cy.request({
                        method: "POST",
                        url: "api/admin/options",
                        headers: {
                            "Authorization": `Bearer ${userFixture.username}:${token}`
                        },
                        body: {
                            key: "shop.subtitle",
                            value: null,
                        }
                    }).then(() => {
                        cy.visit("/");
                        cy.get("#shop-title")
                            .should("exist")
                            .should("have.text", "Test Title");
                        cy.get("#shop-subtitle").should("not.exist");

                        cy.request({
                            method: "POST",
                            url: "api/admin/options",
                            headers: {
                                "Authorization": `Bearer ${userFixture.username}:${token}`
                            },
                            body: {
                                key: "shop.subtitle",
                                value: "Shop Subtitle",
                            }
                        }).then(() => {
                            cy.visit("/");
                            cy.get("#shop-title")
                                .should("exist")
                                .should("have.text", "Test Title");
                            cy.get("#shop-subtitle")
                                .should("exist")
                                .should("have.text", "Shop Subtitle");
                        });
                    });
                });
            });
        });
    });

    it("Delivery Methods", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                const deliveryMethods = ["post", "download"];
                cy.request({
                    method: "POST",
                    url: "api/admin/options",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        key: "shop.delivery",
                        value: deliveryMethods,
                    }
                }).then(() => {
                    cy.visit("/seatselection/1?event=1");
                    cy.get(".seat-selection-free-add").first().click();
                    cy.get(".category-selection").last().click();
                    cy.get("#category-selection-entry0-1").click();
                    cy.get("#stepper-next-button").click();
                    cy.url().should("include", "information");
                    cy.get("#information-address-next").click();

                    cy.wrap(deliveryMethods).each((item) => {
                        cy.get("#checkbox-" + item).should("exist");
                    });
                    cy.get("checkbox-boxoffice").should("not.exist");
                });
            });
        });
    });

    it("Payment Methods", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                const paymentMethods = ["creditcard", "invoice", "paypal"];
                const excludedPaymentMethods = ["stripeiban", "sofort"]
                cy.request({
                    method: "POST",
                    url: "api/admin/options",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        key: "shop.payment-provider",
                        value: paymentMethods,
                    }
                }).then(() => {
                    cy.visit("/seatselection/1?event=1");
                    cy.get(".seat-selection-free-add").first().click();
                    cy.get(".category-selection").last().click();
                    cy.get("#category-selection-entry0-1").click();
                    cy.get("#stepper-next-button").click();
                    cy.url().should("include", "information");

                    cy.get("input[name=address-email]").type(faker.internet.email());
                    cy.get("input[name=address-firstname]").type(faker.name.firstName());
                    cy.get("input[name=address-lastname]").type(faker.name.lastName());
                    cy.get("input[name=address-address]").type(faker.address.streetAddress());
                    cy.get("input[name=address-zip]").type(faker.address.zipCode("#####"));
                    cy.get("input[name=address-city]").type(faker.address.city());

                    cy.get("input[name=address-country-text").type("Germany");
                    cy.get(".MuiAutocomplete-popper").children().first().click();

                    cy.get("input[name=address-region-text").type("Rheinland");
                    cy.get(".MuiAutocomplete-popper").children().first().click();

                    cy.get("#information-address-next").click();
                    cy.get("#checkbox-download").click();
                    cy.get("#stepper-next-button").click();

                    cy.url().should("include", "payment");

                    cy.wrap(paymentMethods).each((item) => {
                        cy.get("#checkbox-" + item).should("exist");
                    });
                    cy.wrap(excludedPaymentMethods).each((item) => {
                        cy.get("#checkbox-" + item).should("not.exist");
                    });
                });
            });
        });
    });
})
