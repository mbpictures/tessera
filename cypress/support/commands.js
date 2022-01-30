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

Cypress.Commands.add("login", (email, password) => {
    cy.visit("/admin/login");
    cy.get("input[name=email]").type(email);
    cy.get("input[name=password]").type(password);
    cy.get("button[type=submit]").click();
});

Cypress.Commands.add("logout", () => {
    cy.visit("/admin");
    cy.get("#account-button").click();
    cy.get("#logout-button").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/admin/login");
});

Cypress.Commands.add("registerInitialAdminUser", () => {
    cy.fixture("admin/user").then((userFixture) => {
        cy.request("POST", "api/admin/user", userFixture).then(({ status }) => {
            expect(status).to.equal(200);
        });
    });
});

Cypress.Commands.add("createToken", () => {
    cy.fixture("admin/user").then((userFixture) => {
        cy.login(userFixture.email, userFixture.password);
        cy.url().should("eq", Cypress.config().baseUrl + "/admin")
        cy.visit("/admin/user/settings");
        cy.get(".MuiAccordion-root").last().click();
        cy.get("#add-api-key-button").click();
        cy.get("#api-key-name").type("test");
        cy.get("#api-key-generate").click();
        cy.get("#api-key-token").then((text) => {
            cy.task("setAdminToken", text.text());
        })
    });
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
                        let updateData = {};
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
                                updateData.seatMapId = parseInt(body);
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
                                    body: updateData
                                }
                            );
                        });
                    });
                });
            });
        });
    });
});
