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

    it("Login user", () => {
        cy.fixture("admin/user").then((userFixture) => {
            cy.login(userFixture.email, userFixture.password);
            cy.url().should("eq", Cypress.config().baseUrl + "/admin")
        });
    });
});
