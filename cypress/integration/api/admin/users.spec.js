describe("Admin Users", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 30000});
    })
    it("Register initial user", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.request("POST", "api/admin/user", userFixture).then(({ status }) => {
                expect(status).to.equal(200);
            });
        });
    });

    it("Wrong login", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password + "_wrong");
            cy.get("#notistack-snackbar").contains("Error while logging in: Username/Password wrong");
            cy.url().should("eq", Cypress.config().baseUrl + "/admin/login");
        });
    });

    it("Login user", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin")
        });
    });

    it("Create API Key", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin")
            cy.visit("/admin/user/settings");
            cy.get(".MuiAccordion-root").last().click();
            cy.get(".MuiAccordion-root").last().find("button").click();
            cy.get("#api-key-name").type("test");
            cy.get("#api-key-generate").click();
            cy.get("#api-key-token").then((text) => {
                cy.log("Token: " + text.text());
                cy.task("setAdminToken", text.text())
            })
        });
    });

    it("GET API", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "GET",
                    url: "api/admin/user",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    }
                }).then(({ body }) => {
                    cy.log("HI");
                    cy.log(body);
                    expect(body.length).to.equal(1);
                    expect(body[0].email).to.equal(userFixture.email);
                });
            })
        });
    });
});
