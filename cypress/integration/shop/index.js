import { formatPrice } from "../../../src/constants/util";

function RGBToHex(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length === 1)
        r = "0" + r;
    if (g.length === 1)
        g = "0" + g;
    if (b.length === 1)
        b = "0" + b;

    return ("#" + r + g + b).toLowerCase();
}

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

    it("Select Seat Map", () => {
        cy.fixture("admin/events").then((eventsFixture) => {
            const seats = eventsFixture.events[1].seatMap.flat(2);
            cy.visit("/seatselection?event=2");

            const selectedIndexes = [0, 1, 2, 3];
            selectedIndexes.forEach((num) => {
                const category = eventsFixture.categories[seats[num].category];
                cy.get(".seat-selection-seatmap-seat").eq(num).then(elem => {
                    expect(RGBToHex(elem[0].style.backgroundColor)).to.equal(category.color.toLowerCase());
                });
                cy.get(".seat-selection-seatmap-seat").eq(num).click();
                cy.get(".seat-selection-seatmap-seat").eq(num).then(elem => {
                    expect(RGBToHex(elem[0].style.backgroundColor)).to.equal(category.activeColor.toLowerCase());
                });
            });

            const price = seats
                .filter((_, index) => selectedIndexes.includes(index))
                .reduce((a, b) => a + eventsFixture.categories[b.category].price, 0);
            cy.get("#payment-overview-total-price").should(
                "have.text",
                formatPrice(price, eventsFixture.categories[0].currency)
            );

            const categoryLabel = eventsFixture.categories[seats[0].category].label;
            cy.get("#payment-overview-category-amount-" + categoryLabel)
                .should("have.text", `${selectedIndexes.length}x: ${categoryLabel}`)
        })
    });
});
