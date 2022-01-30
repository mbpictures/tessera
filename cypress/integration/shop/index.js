describe("Buy tickets", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 30000});
        cy.registerInitialAdminUser();
        cy.createToken();
        cy.createEvents();
    });

    it("Events exist", () => {
        cy.visit("/");

        cy.fixture("admin/events").then((events) => {
            cy.get("input[name=event_selection]").should("have.length", 2);
            cy.get(".container p").should((elements) => {
                const texts = elements.toArray().map(elem => elem.innerText);
                const eventNames = events.events.map(event => event.title);
                expect(texts).to.deep.equal(eventNames);
            });
        });
    })
});
