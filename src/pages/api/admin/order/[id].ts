import {serverAuthenticate} from "../../../../constants/serverUtil";
import {NextApiRequest, NextApiResponse} from "next";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await serverAuthenticate(req);
    if (!user) {
        res.status(401).end("Unauthorized");
        return;
    }
    const { id } = req.query;
    const order = await prisma.order.findUnique({
        where: {
            id: id as string
        },
        include: {
            tickets: true
        }
    });

    if (!order) {
        res.status(404).end("Order not found");
        return;
    }

    if (req.method === "DELETE") {
        await Promise.all(order.tickets.map(async (ticket) => {
            await prisma.ticket.delete({
                where: {
                    id: ticket.id
                }
            });
        }));
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
