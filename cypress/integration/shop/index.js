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
    });

    it("Selecting Event", () => {
        cy.visit("/");

        cy.get("input[name=event_selection]").first().parent().click();
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "seatselection");
        cy.location().should((url) => {
            const queries = new URL(url.toString());
            expect(parseInt(queries.searchParams.get("event"))).to.equal(1);
        });

        cy.visit("/");

        cy.get("input[name=event_selection]").last().parent().click();
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "seatselection");
        cy.location().should((url) => {
            const queries = new URL(url.toString());
            expect(parseInt(queries.searchParams.get("event"))).to.equal(2);
        });
    });
});
