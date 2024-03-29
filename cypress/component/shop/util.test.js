import {
    arrayEquals,
    calculateTotalPrice,
    formatPrice,
    totalSeatAmount,
    totalTicketAmount
} from "../../../src/constants/util";

describe("Utils", () => {
    it("Calculate Total Price", () => {
        const categories = [
            {
                id: 1,
                price: 60.99
            },
            {
                id: 2,
                price: 30.99
            }
        ];
        const seatsOrder = [
            {
                categoryId: 1,
                amount: 1
            },
            {
                categoryId: 1,
                amount: 2
            },
            {
                categoryId: 2,
                amount: 2
            },
            {
                categoryId: 2,
                amount: 1
            }
        ];

        const price = categories[0].price * 3 + categories[1].price * 3
        expect(calculateTotalPrice(seatsOrder, categories)).to.equal(
            price
        );

        const freeSeatOrder = [
            {
                categoryId: 1,
                amount: 3
            },
            {
                categoryId: 2,
                amount: 3
            }
        ];
        expect(calculateTotalPrice(freeSeatOrder, categories)).to.equal(
            price
        );
        const freeSeatOrder2 = [
            {
                categoryId: 1,
                amount: 3
            }
        ];
        expect(calculateTotalPrice(freeSeatOrder2, categories)).to.equal(
            categories[0].price * 3
        )
        expect(calculateTotalPrice([], categories)).to.equal(0);
    })

    it("Total Ticket Amount", () => {
        const seatOrder = {
            tickets: [
                {
                    amount: 2,
                },
                {
                    amount: 1,
                },
                {
                    amount: 1,
                },
                {
                    amount: 2,
                }
            ]
        };
        expect(totalTicketAmount(seatOrder)).to.equal(4);
        expect(totalSeatAmount(seatOrder)).to.equal(6);

        const freeSeatOrder = {
            tickets: [
                {
                    amount: 2
                },
                {
                    amount: 1
                },
                {
                    amount: 1
                },
                {
                    amount: 2
                }
            ]
        };
        expect(totalTicketAmount(freeSeatOrder)).to.equal(4);

        expect(totalTicketAmount({tickets: []})).to.equal(0);
    })

    it("Array Equals", () => {
        expect(arrayEquals([1, 2], [1, 2])).to.equal(true);
        expect(arrayEquals([1, 2], [2, 1])).to.equal(true);
        expect(arrayEquals([1, 3], [2, 1])).to.equal(false);
        expect(arrayEquals([1, 2, 1], [1, 2])).to.equal(false);
        expect(arrayEquals(2, [2])).to.equal(false);
    })

    it("Format Price", () => {
        Object.defineProperty(navigator, "language", {
            value: "en-US",
            configurable: true
        });

        expect(formatPrice(10.99, "USD")).to.equal("$10.99");
        expect(formatPrice(10.99, "EUR")).to.equal("€10.99");

        Object.defineProperty(navigator, "language", {
            value: "de-DE",
            configurable: true
        });

        expect(formatPrice(10.99, "USD")).to.equal("10,99 $");
        expect(formatPrice(10.99, "EUR")).to.equal("10,99 €");

        cy.window().then(win => {
            Object.defineProperty(win, "navigator", {
                value: undefined
            });

            expect(formatPrice(10.99, "USD")).to.equal("");
        })
    })
})
