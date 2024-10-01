import {
    serverAuthenticate
} from "../../../../../constants/serverUtil";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../../constants/interfaces";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Orders,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;
    const { id } = req.query;
    const order = await prisma.order.findUnique({
        where: {
            id: id as string
        },
        include: {
            tickets: true,
            task: true
        }
    });

    if (!order) {
        res.status(404).end("Order not found");
        return;
    }

    if (req.method === "DELETE") {
        await Promise.all(
            order.tickets.map(async (ticket) => {
                await prisma.ticket.delete({
                    where: {
                        id: ticket.id
                    }
                });
            })
        );
        if (order.task?.id)
            await prisma.task.delete({
                where: {
                    id: order.task.id
                }
            })
        await prisma.order.delete({
            where: {
                id: id as string
            }
        });
        res.status(200).end("Deleted");
        return;
    }

    if (req.method === "GET") {
        res.status(200).json(order);
        return;
    }

    res.status(400).end("Method unsupported");
}
