import prisma from "../src/lib/prisma";

async function main() {
    await prisma.category.createMany({
        data: [
            {
                label: "Premium",
                price: 60.99,
                currency: "USD"
            },
            {
                label: "Economy",
                price: 30.99,
                currency: "USD"
            }
        ]
    })

    await prisma.event.create({
        data: {
            title: "Demo Event 1",
            seatType: "free",
            categories: {
                create: [
                    { category: { connect: { id: 1 } } },
                    { category: { connect: { id: 2 } } },
                ]

            }
        }
    })

    await prisma.event.create({
        data: {
            title: "Demo Event 2",
            seatType: "seatmap",
            categories: {
                create: [
                    { category: { connect: { id: 1 } } },
                    { category: { connect: { id: 2 } } },
                ]

            }
        }
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
