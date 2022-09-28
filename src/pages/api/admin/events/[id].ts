import { NextApiRequest, NextApiResponse } from "next";
import {
    revalidateBuild,
    serverAuthenticate
} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.EventManagement,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    const { id } = req.query;
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(id as string)
        },
        include: {
            dates: true
        }
    });

    if (!event) {
        res.status(404).end("Category not found");
        return;
    }

    if (req.method === "GET") {
        res.status(200).json(event);
        return;
    }

    if (req.method === "DELETE") {
        await prisma.categoriesOnEvents.deleteMany({
            where: {
                eventId: parseInt(id as string)
            }
        });
        await prisma.event.delete({
            where: {
                id: parseInt(id as string)
            }
        });
        await revalidateBuild(res, ["/"]);
        res.status(200).end("Deleted");
        return;
    }

    if (req.method === "PUT") {
        let { title, seatType, seatMapId, categories, personalTicket, maxAmounts = {}, dates } = req.body;

        if (!categories && seatType === "seatmap") {
            const seatMap = await prisma.seatMap.findUnique({
                where: {
                    id: seatMapId
                }
            });
            const definition = JSON.parse(seatMap.definition);
            // transform to category ids and receive only unique ids
            categories = definition
                .map((row) => row.map((seat) => seat.category))
                .flat(2)
                .filter(
                    (value, index, self) =>
                        self.indexOf(value) === index && value !== undefined
                );
        }

        if (categories) {
            await prisma.categoriesOnEvents.deleteMany({
                where: {
                    eventId: parseInt(id as string)
                }
            });

            for (const category of categories) {
                await prisma.categoriesOnEvents.create({
                    data: {
                        eventId: parseInt(id as string),
                        categoryId: category,
                        maxAmount: maxAmounts[category] ?? null
                    }
                })
            }
        }

        if (dates) {
            const eventDates = await prisma.eventDate.findMany({
                where: {
                    eventId: parseInt(id as string)
                },
                select: {
                    id: true,
                    orders: true
                }
            });
            const eventDateIds = eventDates.map(eventDate => eventDate.id)
            for(const date of dates) {
                if (date.id && eventDateIds.includes(date.id)) {
                    await prisma.eventDate.update({
                        where: {
                            id: date.id
                        },
                        data: date
                    });
                    continue;
                }

                await prisma.eventDate.create({
                    data: {
                        ...date,
                        event: {
                            connect: {
                                id: parseInt(id as string)
                            }
                        }
                    }
                });
            }
            const eventDatesDelete = eventDateIds.filter(id => !dates.some(date => date.id === id));
            if (eventDatesDelete.length > 0) {
                if (eventDates.filter(date => eventDatesDelete.includes(date.id)).some(date => date.orders.length > 0))
                    return res.status(400).end("The Date you want to delete has already orders and therefor can't be deleted!")
                await prisma.eventDate.deleteMany({
                    where: {
                        id: {
                            in: eventDatesDelete
                        }
                    }
                });
            }
        }

        await prisma.event.update({
            where: {
                id: parseInt(id as string)
            },
            data: {
                ...(title && { title: title }),
                ...(seatType && { seatType: seatType }),
                ...(seatMapId && { seatMapId: seatMapId }),
                ...(personalTicket && { personalTicket })
            }
        });

        await revalidateBuild(res, ["/", `/seatselection/${id as string}`, "/information"]);
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method unsupported");
}
