// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import ejs from "ejs";

import { faker } from "@faker-js/faker";

Cypress.Commands.add("login", (email, password) => {
    cy.visit("/admin/login");
    cy.get("input[name=email]").type(email);
    cy.get("input[name=password]").type(password);
    cy.get("button[type=submit]").click();
});

Cypress.Commands.add("logout", () => {
    cy.visit("/admin");
    cy.location().then((loc) => {
        if (loc.pathname === "/admin/login") return;
        cy.get("#account-button").click();
        cy.get("#logout-button").click();
        cy.url().should("eq", Cypress.config().baseUrl + "/admin/login");
    });
});

Cypress.Commands.add("registerInitialAdminUser", () => {
    cy.fixture("admin/user").then((userFixture) => {
        cy.request("POST", "api/admin/user", userFixture).then(({ status }) => {
            expect(status).to.equal(200);
        });
    });
});

Cypress.Commands.add("createToken", (skipStoreToken) => {
    cy.fixture("admin/user").then((userFixture) => {
        cy.login(userFixture.email, userFixture.password);
        cy.url().should("eq", Cypress.config().baseUrl + "/admin")
        cy.visit("/admin/user/settings");
        cy.get(".MuiAccordion-root").eq(1).click();
        cy.get("#add-api-key-button").click();
        cy.get("#api-key-name").type("test");
        cy.get("#api-key-generate").click();
        if (skipStoreToken) return;
        cy.get("#api-key-token").then((text) => {
            cy.task("setAdminToken", text.text());
        })
    });
});

Cypress.Commands.add("getEmailHtml", (firstName, lastName, containsTickets, invoicePath) => {
    cy.readFile("src/assets/email/template.html").then((file) => {
        return ejs.render(
            file,
            {
                customerName: firstName + " " + lastName,
                containsTickets: containsTickets,
                containsInvoice: invoicePath === undefined ? undefined : true
            }
        )
    })
});

Cypress.Commands.add("createEvents", () => {
    cy.fixture("admin/user").then((userFixture) => {
        cy.fixture("admin/events").then((eventsFixture) => {
            cy.task("getAdminToken").then( async (token) => {
                for(let i = 0; i < eventsFixture.categories.length; i++) {
                    cy.request(
                        {
                            url: "/api/admin/category",
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${userFixture.username}:${token}`
                            },
                            body: eventsFixture.categories[i]
                        }
                    )
                }
                eventsFixture.events.forEach((event) => {
                    cy.request(
                        {
                            url: "/api/admin/category",
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${userFixture.username}:${token}`
                            }
                        }
                    ).then((categoryResponse) => {
                        const categoryIds = categoryResponse.body.map(category => category.id);
                        const eventData = {
                            title: event.title,
                            seatType: event.seatType
                        };
                        let updateData = {
                            seatType: event.seatType
                        };
                        if ("seatMap" in event) {
                            const seatMapDefinition = event.seatMap.map((row) => {
                                return row.map((seat) => {
                                    return {
                                        ...seat,
                                        category: categoryIds[seat.category]
                                    }
                                });
                            })
                            cy.request(
                                {
                                    url: "/api/admin/seatmap",
                                    method: "POST",
                                    headers: {
                                        "Authorization": `Bearer ${userFixture.username}:${token}`
                                    },
                                    body: {
                                        definition: seatMapDefinition
                                    }
                                }
                            ).then(({ body }) => {
                                updateData["seatMapId"] = parseInt(body);
                            });
                        }
                        if ("categories" in event) {
                            updateData.categories = event.categories.map((_, index) => categoryIds[index]);
                        }

                        cy.log(updateData);

                        cy.request(
                            {
                                url: "/api/admin/events",
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${userFixture.username}:${token}`
                                },
                                body: eventData
                            }
                        ).then(({ body }) => {
                            cy.request(
                                {
                                    url: "/api/admin/events/" + body,
                                    method: "PUT",
                                    headers: {
                                        "Authorization": `Bearer ${userFixture.username}:${token}`
                                    },
                                    body: updateData,
                                    timeout: 60000
                                }
                            );
                        });
                    });
                });
            });
        });
    });
});

Cypress.Commands.add("setOption", (key, value) => {
    cy.fixture("admin/user").then((userFixture) => {
        cy.task("getAdminToken").then((token) => {
            cy.request(
                {
                    url: "/api/admin/options",
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        key,
                        value
                    }
                }
            );
        });
    })
});

Cypress.Commands.add("purchaseTicket", (options) => {
    const event = options?.event ? options.event : 1;
    cy.visit(`/seatselection/${event}?event=${event}`);

    if (options?.selectSeatFunction) {
        options.selectSeatFunction();
    } else {
        cy.get(".seat-selection-free-add").first().click();
        cy.get(".category-selection").first().click();
        cy.get("#category-selection-entry0-1").click();
    }
    cy.get("#stepper-next-button").click();
    cy.url().should("include", "information");

    if (options?.information !== undefined && !options?.information) return;

    cy.personalInformation().then((information) => {
        if (options?.shippingMethod !== undefined && !options?.shippingMethod) return cy.wrap(information);
        const shipping = options?.shippingMethod ? options.shippingMethod : "download";
        cy.get("#information-address-next").click();
        cy.get("#checkbox-" + shipping).click();
        cy.get("#stepper-next-button").click();

        cy.url().should("include", "payment");

        if (options?.paymentMethod !== undefined && !options?.paymentMethod) return cy.wrap(information);
        const payment = options?.paymentMethod ?? "invoice";
        cy.get("#checkbox-" + payment).click();
        cy.get("#pay-button").click();

        cy.url().should("include", "/checkout");
        return cy.wrap(information);
    });
});

Cypress.Commands.add("personalInformationCountry", () => {
    cy.get("input[name=address-country-text").type("Germany");
    cy.get(".MuiAutocomplete-popper").children().first().click();

    cy.get("input[name=address-region-text").type("Rheinland");
    cy.get(".MuiAutocomplete-popper").children().first().click();
});

Cypress.Commands.add("personalInformation", () => {
    const email = faker.internet.email();
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    cy.get("input[name=address-email]").type(email);
    cy.get("input[name=address-firstname]").type(firstName);
    cy.get("input[name=address-lastname]").type(lastName);
    cy.get("input[name=address-address]").type(faker.address.streetAddress());
    cy.get("input[name=address-zip]").type(faker.address.zipCode("#####"));
    cy.get("input[name=address-city]").type(faker.address.city());

    cy.personalInformationCountry().then(() => ({email, firstName, lastName}));
})

Cypress.Commands.add('iframe', { prevSubject: 'element' }, ($iframe, callback = () => { }) => {
    return cy
        .wrap($iframe)
        .should(iframe => expect(iframe.contents().find('body')).to.exist)
        .then(iframe => cy.wrap(iframe.contents().find('body')))
        .within({}, callback)
})
