import prisma from "../src/lib/prisma";
import { faker } from '@faker-js/faker';

function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function main() {
    const category1 = await prisma.category.create({
        data: {
            label: "Premium",
            price: 60.99,
            currency: "USD",
            color: "#59bb59"
        }
    })
    const category2 = await prisma.category.create({
        data: {
            label: "Economy",
            price: 30.99,
            currency: "USD",
            color: "#59B8BB"
        }
    })
    const categories = [category1, category2];

    const seatmap = await prisma.seatMap.create({
        data: {
            definition: "[[{\"id\":1,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":2,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":3,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":4,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":5,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":6,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":7,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":8,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":9,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":10,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":11,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":12,\"category\":1,\"amount\":1,\"type\":\"seat\"}],[{\"id\":13,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":14,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":15,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":16,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":17,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":18,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":19,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":20,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":21,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":22,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":23,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":24,\"category\":1,\"amount\":1,\"type\":\"seat\"}],[{\"id\":25,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":26,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":27,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":28,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":29,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":30,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":31,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":32,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":33,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":34,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":35,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":36,\"category\":1,\"amount\":1,\"type\":\"seat\"}],[{\"id\":37,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":38,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":39,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":40,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":41,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":42,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":43,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":44,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":45,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":46,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":47,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":48,\"category\":1,\"amount\":1,\"type\":\"seat\"}],[{\"id\":49,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":50,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":51,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":52,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":53,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":54,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":55,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":56,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":57,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":58,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":59,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":60,\"category\":1,\"amount\":1,\"type\":\"seat\"}],[{\"id\":61,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":62,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":63,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":64,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":65,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":66,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":67,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":68,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":69,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":70,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":71,\"category\":1,\"amount\":1,\"type\":\"seat\"},{\"id\":72,\"category\":1,\"amount\":1,\"type\":\"seat\"}],[{\"id\":73,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":74,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":75,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":76,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":77,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":78,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":79,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":80,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":81,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":82,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":83,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":84,\"category\":2,\"amount\":1,\"type\":\"seat\"}],[{\"id\":85,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":86,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":87,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":88,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":89,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":90,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":91,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":92,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":93,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":94,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":95,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":96,\"category\":2,\"amount\":1,\"type\":\"seat\"}],[{\"id\":97,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":98,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":99,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":100,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":101,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":102,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":103,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":104,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":105,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":106,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":107,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":108,\"category\":2,\"amount\":1,\"type\":\"seat\"}],[{\"id\":109,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":110,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":111,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":112,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":113,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":114,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":115,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":116,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":117,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":118,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":119,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":120,\"category\":2,\"amount\":1,\"type\":\"seat\"}],[{\"id\":121,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":122,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":123,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":124,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":125,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":126,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"type\":\"space\"},{\"id\":127,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":128,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":129,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":130,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":131,\"category\":2,\"amount\":1,\"type\":\"seat\"},{\"id\":132,\"category\":2,\"amount\":1,\"type\":\"seat\"}]]"
        }
    });

    const freeSeatEvent = await prisma.event.create({
        data: {
            title: "Demo Event 1",
            seatType: "free",
            categories: {
                create: [
                    {category: {connect: {id: 1}}},
                    {category: {connect: {id: 2}}},
                ]

            }
        }
    })

    const seatMapEvent = await prisma.event.create({
        data: {
            title: "Demo Event 2",
            seatType: "seatmap",
            categories: {
                create: [
                    {category: {connect: {id: 1}}},
                    {category: {connect: {id: 2}}},
                ]
            },
            seatMap: {
                connect: {
                    id: seatmap.id
                }
            }
        }
    })

    for (let i = 0; i < 100; i++) {
        const amount = getRandom(1, 10);
        const categoryId = getRandom(categories[0].id, categories[categories.length - 1].id);
        let tickets = Array.from(Array(amount).keys()).map(() => ({
            used: false,
            categoryId: categoryId
        }));
        if (i % 2 === 0) {
            tickets.forEach((ticket, j) => {
                ticket["seatId"] = i * 10 + j;
            })
        }
        const date = new Date();
        date.setDate(date.getDate() - getRandom(1, 29));
        await prisma.order.create({
            data: {
                user: {
                    create: {
                        firstName: faker.name.firstName(),
                        lastName: faker.name.lastName(),
                        address: faker.address.streetAddress(true),
                        city: faker.address.city(),
                        zip: faker.address.zipCode(),
                        email: faker.internet.email(),
                        countryCode: faker.address.countryCode(),
                        regionCode: faker.address.cityPrefix()
                    }
                },
                paymentType: "invoice",
                shipping: JSON.stringify({type: "download", data: {}}),
                locale: "en-GB",
                event: {
                    connect: {
                        id: i % 2 === 0 ? freeSeatEvent.id : seatMapEvent.id
                    }
                },
                date: date,
                tickets: {
                    create: tickets
                }
            }
        })
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
