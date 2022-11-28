import { getStoreWithOrderId, storeOrderAndUser } from "../../../src/constants/util";
import { faker } from "@faker-js/faker";
import countryData from "country-region-data";

describe("Util", () => {
    before(() => {
        cy.task("db:teardown", null, {timeout: 60000});
        cy.registerInitialAdminUser();
        cy.createToken();
        cy.createEvents();
    });

    it("Store/Load Order", () => {
        cy.visit("/");
        cy.wrap(null).then(() => {
            const orderOriginal = {
                tickets: [
                    {
                        categoryId: 1,
                        amount: 2
                    }
                ],
                orderId: null
            };
            const country = countryData[0];
            const user = {
                email: faker.internet.email(),
                shipping: {
                    data: null,
                    type: "download"
                },
                address: {
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    address: faker.address.streetAddress(),
                    city: faker.address.city(),
                    zip: faker.address.zipCode("#####"),
                    country: country,
                    region: country.regions.length > 0 ? country.regions[0] : null
                },
                serverCustomFields: [],
                customFields: null
            };

            cy.storeOrderAndUser(orderOriginal, user, 1, "invoice").then(({userId, orderId}) => {
                expect(userId).to.not.equal(null).equal(undefined);
                expect(orderId).to.not.equal(null).equal(undefined);

                cy.getStoreWithOrderId(orderId).then(({personalInformation, order, eventId}) => {
                    expect(order.tickets[0].categoryId).to.equal(orderOriginal.tickets[0].categoryId);
                    expect(order.tickets[0].amount).to.equal(orderOriginal.tickets[0].amount);
                    user.userId = userId;
                    expect(personalInformation).to.deep.equal(user);
                    expect(eventId).to.equal(1);

                    cy.storeOrderAndUser(order, personalInformation).then(secondStore => {
                        expect(secondStore.userId).to.equal(userId);
                    })
                })
            })
        })
    })
})

Cypress.Commands.add("storeOrderAndUser", async (orderOriginal, user, eventId, paymentType) => {
    return await storeOrderAndUser(
        orderOriginal,
        user,
        eventId,
        paymentType
    );
});

Cypress.Commands.add("getStoreWithOrderId", async (orderId) => {
    return await getStoreWithOrderId(orderId);
})
