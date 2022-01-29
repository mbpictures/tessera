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

    it("Rename own user", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/user/settings");
            cy.get(".MuiAccordion-root").first().click();
            const newUser = userFixture.username + "_changed";
            const newEmail = userFixture.email + "changed";
            cy.get("#change-username").clear().type(newUser);
            cy.get("#change-email").clear().type(newEmail);
            cy.get("#change-save").click();
            cy.wait(500);
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "GET",
                    url: "api/admin/user/1",
                    headers: {
                        "Authorization": `Bearer ${newUser}:${token}`
                    }
                }).then(({ body }) => {
                    expect(body.userName).to.equal(newUser);
                    expect(body.email).to.equal(newEmail);

                    cy.login(newEmail, userFixture.password);
                    cy.url().should("eq", Cypress.config().baseUrl + "/admin");
                    cy.visit("/admin/user/settings");
                    cy.get(".MuiAccordion-root").first().click();
                    cy.get("#change-username").clear().type(userFixture.username);
                    cy.get("#change-email").clear().type(userFixture.email);
                    cy.get("#change-save").click();
                });
            });
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
                    expect(body.length).to.equal(1);
                    expect(body[0].email).to.equal(userFixture.email);
                });
            })
        });
    });

    it("PUT API", () => {
        cy.fixture("admin/user").then((userFixture) => {
            const newName = userFixture.username + "_modified";
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "PUT",
                    url: "api/admin/user/1",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        email: userFixture.email,
                        username: newName
                    }
                }).then(({ status }) => {
                    expect(status).to.equal(200);
                    cy.request({
                        method: "GET",
                        url: "api/admin/user/1",
                        headers: {
                            "Authorization": `Bearer ${newName}:${token}`
                        }
                    }).then(({ body }) => {
                        expect(body.userName).to.equal(newName);
                        cy.request({
                            method: "PUT",
                            url: "api/admin/user/1",
                            headers: {
                                "Authorization": `Bearer ${newName}:${token}`
                            },
                            body: {
                                email: userFixture.email,
                                username: userFixture.username
                            }
                        }).then(({ status }) => {
                            expect(status).to.equal(200);
                        });
                    });
                });
            });
        })
    });

    it("POST API", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "POST",
                    url: "api/admin/user",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        username: userFixture.username,
                        password: userFixture.password,
                        email: userFixture.email
                    },
                    failOnStatusCode: false
                }).then(({ status, body }) => {
                    expect(status).to.equal(400);
                    expect(body).to.equal("Username and email have to be unique!");
                });

                cy.request({
                    method: "POST",
                    url: "api/admin/user",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    },
                    body: {
                        username: userFixture.username + "new",
                        password: userFixture.password,
                        email: userFixture.email + "new"
                    }
                }).then(({ status, body }) => {
                    expect(status).to.equal(200);
                    expect(body).to.equal(2);
                });
            })
        });
    });

    it("DELETE API", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "DELETE",
                    url: "api/admin/user/2",
                    headers: {
                        "Authorization": `Bearer ${userFixture.username}:${token}`
                    }
                }).then(({ status, body }) => {
                    expect(status).to.equal(200);
                    expect(body).to.equal("Deleted");
                });
            })
        });
    });
});
