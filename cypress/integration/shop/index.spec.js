import { formatPrice } from "../../../src/constants/util";
import { faker } from '@faker-js/faker';

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
        cy.task("db:teardown", null, {timeout: 60000});
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
        cy.get("input[name=event_selection]").first().should("be.checked");
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "seatselection");
        cy.location().should((url) => {
            const queries = new URL(url.toString());
            expect(parseInt(queries.searchParams.get("event"))).to.equal(1);
        });

        cy.visit("/");

        cy.get("input[name=event_selection]").last().parent().click();
        cy.get("input[name=event_selection]").last().should("be.checked");
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "seatselection");
        cy.location().should((url) => {
            const queries = new URL(url.toString());
            expect(parseInt(queries.searchParams.get("event"))).to.equal(2);
        });
    });

    it("Select Free Seats", () => {
        cy.visit("/seatselection/1?event=1");

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
            cy.visit("/seatselection/2?event=2");

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

    it("Enter Information", () => {
        cy.visit("/seatselection/1?event=1");
        cy.get(".seat-selection-free-add").first().click();
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "information");

        const testInputField = (element, notValidInput, validInput, errorText) => {
            cy.get(element).type(notValidInput).blur();
            cy.contains(errorText).should("exist");
            cy.get(element).clear();
            cy.get(element).type(validInput).blur();
            cy.contains(errorText).should("not.exist");
        }

        testInputField("input[name=address-email]", "not_valid", faker.internet.email(), "Please enter valid email address");
        testInputField("input[name=address-firstname]", "a", faker.name.firstName(), "Please enter your firstname here!");
        testInputField("input[name=address-lastname]", "a", faker.name.lastName(), "Please enter your lastname here!");
        testInputField("input[name=address-address]", "aaaaaa", faker.address.streetAddress(), "Please enter street and house number!");
        testInputField("input[name=address-zip]", "5445", faker.address.zipCode("#####"), "Please enter a valid ZIP Code");
        testInputField("input[name=address-city]", "aa", faker.address.city(), "Please enter your city!");

        cy.get("input[name=address-country-text").type("Germany");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("input[name=address-region-text").type("Rheinland");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("#checkbox-download").click();
        cy.get("#stepper-next-button").should("be.enabled");
        cy.get("#checkbox-download").click();
        cy.get("#stepper-next-button").should("not.be.enabled");
        cy.get("#checkbox-download").click();
        cy.get("#stepper-next-button").should("be.enabled");
    });

    it("Select Payment", () => {
        cy.visit("/seatselection/1?event=1");
        cy.get(".seat-selection-free-add").first().click();
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "information");

        cy.get("input[name=address-email]").type(faker.internet.email());
        cy.get("input[name=address-firstname]").type(faker.name.firstName());
        cy.get("input[name=address-lastname]").type(faker.name.lastName());
        cy.get("input[name=address-address]").type(faker.address.streetAddress());
        cy.get("input[name=address-zip]").type(faker.address.zipCode("#####"));
        cy.get("input[name=address-city]").type(faker.address.city());

        cy.get("input[name=address-country-text").type("Germany");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("input[name=address-region-text").type("Rheinland");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("#checkbox-download").click();
        cy.get("#stepper-next-button").click();

        cy.url().should("include", "payment");

        cy.get("#pay-button").should("be.disabled");
        cy.get("#checkbox-creditcard").click();
        cy.get("#stripe-card-name").type(faker.name.findName());
        cy.get("#stripe-card-number iframe")
            .iframe()
            .find("input[name=cardnumber]")
            .type(`4242424242424242`);

        const expirationData = new Date(Date.now() + 1000*60*60*24*30*6);
        cy.get("#stripe-card-expire iframe")
            .iframe()
            .find("input[name=exp-date]")
            .type(`${expirationData.getMonth()}-${expirationData.getFullYear().toString().substr(-2)}`);

        cy.get("#stripe-card-cvc iframe")
            .iframe()
            .find("input[name=cvc]")
            .type(faker.finance.creditCardCVV());

        cy.get("#pay-button").should("be.enabled");
    });

    it("Check Delivery Variants", () => {
        cy.setOption("shop.delivery", ["boxoffice", "download", "post"]).then(() => {
            cy.visit("/seatselection/1?event=1");
            cy.get(".seat-selection-free-add").first().click();
            cy.get("#stepper-next-button").click();
            cy.url().should("include", "information");

            cy.get("input[name=address-email]").type(faker.internet.email());
            cy.get("input[name=address-firstname]").type(faker.name.firstName());
            cy.get("input[name=address-lastname]").type(faker.name.lastName());
            cy.get("input[name=address-address]").type(faker.address.streetAddress());
            cy.get("input[name=address-zip]").type(faker.address.zipCode("#####"));
            cy.get("input[name=address-city]").type(faker.address.city());

            cy.get("input[name=address-country-text").type("Germany");
            cy.get(".MuiAutocomplete-popper").children().first().click();

            cy.get("input[name=address-region-text").type("Rheinland");
            cy.get(".MuiAutocomplete-popper").children().first().click();

            cy.get("#checkbox-boxoffice").click();
            cy.get("#stepper-next-button").should("be.enabled");

            cy.get("#checkbox-post").click();
            cy.get("#stepper-next-button").should("be.enabled");
            cy.get("#checkbox-differing-shipping-address").click();
            cy.get("#stepper-next-button").should("be.disabled");

            cy.get("#checkbox-post").find("input[name=address-firstname]").type(faker.name.firstName());
            cy.get("#checkbox-post").find("input[name=address-lastname]").type(faker.name.lastName());
            cy.get("#checkbox-post").find("input[name=address-address]").type(faker.address.streetAddress());
            cy.get("#checkbox-post").find("input[name=address-zip]").type(faker.address.zipCode("#####"));
            cy.get("#checkbox-post").find("input[name=address-city]").type(faker.address.city());

            cy.get("#checkbox-post").find("input[name=address-country-text]").type("Germany");
            cy.get(".MuiAutocomplete-popper").children().first().click();

            cy.get("#checkbox-post").find("input[name=address-region-text]").type("Rheinland");
            cy.get(".MuiAutocomplete-popper").children().first().click();
            cy.get("#stepper-next-button").should("be.enabled");
        })
    });

    it("Check Payment Variants", () => {
        cy.visit("/seatselection/1?event=1");
        cy.get(".seat-selection-free-add").first().click();
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "information");

        cy.get("input[name=address-email]").type(faker.internet.email());
        cy.get("input[name=address-firstname]").type(faker.name.firstName());
        cy.get("input[name=address-lastname]").type(faker.name.lastName());
        cy.get("input[name=address-address]").type(faker.address.streetAddress());
        cy.get("input[name=address-zip]").type(faker.address.zipCode("#####"));
        cy.get("input[name=address-city]").type(faker.address.city());

        cy.get("input[name=address-country-text").type("Germany");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("input[name=address-region-text").type("Rheinland");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("#checkbox-download").click();
        cy.get("#stepper-next-button").click();

        cy.url().should("include", "payment");

        cy.get("#pay-button").should("be.disabled");
        cy.get("#checkbox-invoice").click();
        cy.get("#pay-button").should("exist").and("be.enabled");
        cy.get("#checkbox-sofort").click();
        cy.get("#pay-button").should("exist").and("be.enabled");
        cy.get("#checkbox-paypal").click();
        cy.get(".paypal-buttons").should("have.length.at.least", 1);
        cy.get("#pay-button").should("not.exist");
    });

    it("Process Payment", () => {
        cy.visit("/seatselection/1?event=1");
        cy.get(".seat-selection-free-add").first().click();
        cy.get("#stepper-next-button").click();
        cy.url().should("include", "information");

        const email = faker.internet.email();
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        cy.get("input[name=address-email]").type(email);
        cy.get("input[name=address-firstname]").type(firstName);
        cy.get("input[name=address-lastname]").type(lastName);
        cy.get("input[name=address-address]").type(faker.address.streetAddress());
        cy.get("input[name=address-zip]").type(faker.address.zipCode("#####"));
        cy.get("input[name=address-city]").type(faker.address.city());

        cy.get("input[name=address-country-text").type("Germany");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("input[name=address-region-text").type("Rheinland");
        cy.get(".MuiAutocomplete-popper").children().first().click();

        cy.get("#checkbox-download").click();
        cy.get("#stepper-next-button").click();

        cy.url().should("include", "payment");

        cy.get("#checkbox-invoice").click();
        cy.get("#pay-button").click();

        cy.url().should("include", "/checkout");

        cy.task("getLastEmail", email).then(result => {
            cy.state('document').write(result.html)
            cy.get("body").should("contain.text", `Hello ${firstName} ${lastName}`);
            cy.get("body").should("not.contain.text", 'As you have opted for downloadable tickets, this email also contains the tickets. You can also find them in the attachment.');
            cy.get("body").should("contain.text", 'We hereby confirm your\n' +
                '                                                    order. Enclosed you will\n' +
                '                                                    find an invoice.');
        });
    });
});
