import { send } from "../../../../lib/send";
import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Orders,
        permissionType: PermissionType.Write
    });
    if (!user) return;

    if (req.method !== "POST") {
        return res.status(400).end("Unsupported method!");
    }

    const params = { ...req.query, ...req.body };
    if (!params.orderId) {
        return res.status(400).end(
            "Missing param: orderId!"
        );
    }
    const order = await prisma.order.findUnique({
        where: {
            id: params.orderId
        },
        include: {
            tickets: true
        }
    });
    if (!order) {
        return res.status(404).end("Order not found!")
    }
    if (params.invoice) {
        await prisma.order.update({
            where: {
                id: params.orderId
            },
            data: {
                invoiceSent: false
            }
        });
    }
    if (params.tickets) {
        await Promise.all(order.tickets.map(async (t) => {
            await prisma.ticket.update({
                where: {
                    id: t.id
                },
                data: {
                    secret: null
                }
            });
        }));
    }
    await send(params.orderId);

    return res.status(200).end("OK");
}
