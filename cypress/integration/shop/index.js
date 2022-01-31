import { formatPrice } from "../../../src/constants/util";

describe("Buy tickets", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 30000});
        cy.registerInitialAdminUser();
        cy.createToken();
        cy.createEvents();
    });

    it("Events exist", () => {
        cy.visit("/", {timeout: 8000});

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
        cy.visit("/", {timeout: 8000});

        cy.get("input[name=event_selection]").first().parent().click();
        cy.get("input[name=event_selection]").first().should("be.checked");
        cy.get("#stepper-next-button").click();
        cy.url({timeout: 8000}).should("include", "seatselection");
        cy.location().should((url) => {
            const queries = new URL(url.toString());
            expect(parseInt(queries.searchParams.get("event"))).to.equal(1);
        });

        cy.visit("/", {timeout: 8000});

        cy.get("input[name=event_selection]").last().parent().click();
        cy.get("input[name=event_selection]").last().should("be.checked");
        cy.get("#stepper-next-button").click();
        cy.url({timeout: 8000}).should("include", "seatselection");
        cy.location().should((url) => {
            const queries = new URL(url.toString());
            expect(parseInt(queries.searchParams.get("event"))).to.equal(2);
        });
    });

    it("Select Free Seats", () => {
        cy.visit("/seatselection?event=1");

        cy.get(".seat-selection-free-add").first().click();
        cy.get(".seat-selection-free-ticket-amount input").should("have.value", "1");
        cy.get(".seat-selection-free-add").first().click();
        cy.get(".seat-selection-free-ticket-amount input").should("have.value", "2");
        cy.get(".seat-selection-free-remove").first().click();
        cy.get(".seat-selection-free-ticket-amount input").should("have.value", "1");

        cy.fixture("admin/events").then((eventFixture) => {
            cy.get(".category-selection").first().click();
            cy.get("#category-selection-entry0-1").click();

            const firstCategory = eventFixture.categories[0];
            const secondCategory = eventFixture.categories[1];
            cy.get("#seat-selection-free-total-price").should(
                "have.text",
                formatPrice(firstCategory.price, firstCategory.currency)
            );

            cy.get(".category-selection").first().click();
            cy.get("#category-selection-entry0-2").click();

            cy.get("#seat-selection-free-total-price").should(
                "have.text",
                formatPrice(secondCategory.price, secondCategory.currency)
            );

            cy.get("#stepper-next-button").should("not.be.disabled");
            cy.get(".seat-selection-free-remove").first().click();
            cy.get("#stepper-next-button").should("be.disabled");
        });
    });
});
