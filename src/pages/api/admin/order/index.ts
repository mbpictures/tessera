import { NextApiRequest, NextApiResponse } from "next";
import {
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
        permissionType: PermissionType.Read
    });
    if (!user) return;

    if (req.method === "GET") {
        const request = {
            include: {
                event: true,
                user: true
            }
        }
        let {page, amount, shippingFilter, eventId, event}: any = req.query;

        if (amount) {
            request["take"] = parseInt(amount as string);
            if (page)
                request["skip"] = parseInt(page as string) * parseInt(amount as string);
        }
        if (shippingFilter) {
            request["where"]["shipping"]["contains"] = `"type":"${shippingFilter}"`;
        }
        if (eventId) {
            request["where"]["eventId"] = eventId;
        }
        if (event) {
            request["where"]["event"]["title"] = event;
        }

        const orders = await prisma.order.findMany(request);
        res.status(200).json(orders);
        return;
    }

    res.status(400).end("Method not allowed");
}
