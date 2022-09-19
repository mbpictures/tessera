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
        let { title, seatType, seatMapId, categories, personalTicket, maxAmounts } = req.body;

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
                        maxAmount: maxAmounts[category]
                    }
                })
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
