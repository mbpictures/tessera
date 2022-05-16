describe("Admin Users", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 60000});
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
            cy.visit("/admin/user/settings", {
                onBeforeLoad(win) {
                    cy.spy(win.navigator.clipboard, "writeText").as("copy");
                }
            });
            cy.get(".MuiAccordion-root").eq(1).click();
            cy.get("#add-api-key-button").click();
            cy.get("#api-key-name").type("test");
            cy.get("#api-key-generate").click();
            cy.get("#api-key-token").then((text) => {
                cy.log("Token: " + text.text());
                cy.task("setAdminToken", text.text());
                cy.get("#api-key-copy-to-clipboard").focus();
                cy.get("#api-key-copy-to-clipboard").click();
                cy.get("@copy").should("be.calledWithExactly", text.text());
            })
        });
    });

    it("Delete API Key", () => {
        cy.createToken(true);

        cy.get("#api-key-close-button").click();
        cy.get(".delete-api-key-button").should("have.length", 2);
        cy.get(".MuiAccordion-root").eq(1).click();
        cy.get(".delete-api-key-button").last().click();
        cy.get("#confirm-confirm-button").click();
        cy.get("#confirm-confirm-button").should("not.exist");

        cy.visit("/admin/user/settings");
        cy.get(".MuiAccordion-root").eq(1).click();
        cy.get(".delete-api-key-button").should("have.length", 1);
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
            cy.logout();
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

    it("Change Password", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/user/settings");
            cy.get(".MuiAccordion-root").first().click();
            cy.get("#change-password").click();
            const newPassword = userFixture.password + "_changed";
            cy.get("#change-password-current").type(userFixture.password);
            cy.get("#change-password-new").clear().type(newPassword);
            cy.get("#change-password-new-confirm").clear().type(newPassword);
            cy.get("#change-password-button").click();
            cy.logout();

            cy.login(userFixture.email, newPassword);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/user/settings");
            cy.get(".MuiAccordion-root").first().click();
            cy.get("#change-password").click();
            cy.get("#change-password-current").type(newPassword);
            cy.get("#change-password-new").clear().type(userFixture.password);
            cy.get("#change-password-new-confirm").clear().type(userFixture.password);
            cy.get("#change-password-button").click();
        });
    });

    it("Create/Update/Delete User", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin");
            cy.visit("/admin/users");
            cy.get(".user-edit-button").should("have.length", 1);

            cy.get("#add-user-button").click();
            cy.get("input[name=username]").type("seconduser");
            cy.get("input[name=email]").type("seconduser@email.com");
            cy.get("input[name=password]").type("userpass");
            cy.get("input[name=confirmPassword]").type("userpass");
            cy.get("button[type=submit]").click();

            cy.get(".user-edit-button").should("have.length", 2);
            cy.get(".user-edit-button").last().click();
            cy.get("input[type=checkbox]").click({multiple: true});
            cy.get("#edit-user-save").click();

            cy.visit("/admin/users")
            cy.get(".user-edit-button").last().click();
            cy.get("#edit-user-delete").click();

            cy.get("#confirm-confirm-button").click();
            cy.get("#confirm-confirm-button").should("not.exist");

            cy.get(".user-edit-button").should("have.length", 1);
        }) ;
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
                    expect(body).to.equal(3);
                });
            })
        });
    });

    it("DELETE API", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.task("getAdminToken").then((token) => {
                cy.request({
                    method: "DELETE",
                    url: "api/admin/user/3",
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
