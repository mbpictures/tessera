import {NextApiRequest, NextApiResponse} from "next";
import {PermissionSection, PermissionType, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.EventManagement,
        permissionType: PermissionType.Write
    });
    if (!user) return;

    if (req.method !== "DELETE") {
        res.status(400).end("Method unsupported");
        return;
    }

    try {
        const orders = await prisma.order.findMany({include: {tickets: true}});
        const promises = orders.map(async (order) => {
            // delete all tickets for order
            await Promise.all(order.tickets.map(async (ticket) => {
                await prisma.ticket.delete({
                    where: {
                        id: ticket.id
                    }
                })
            }));
            // delete order
            await prisma.order.delete({
                where: {
                    id: order.id
                }
            });
        });
        await Promise.all(promises);
        res.status(200).end("Deleted");
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}
