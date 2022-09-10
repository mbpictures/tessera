import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import {
    PermissionSection,
    PermissionType
} from "../../../../constants/interfaces";
import { ShippingFactory } from "../../../../store/factories/shipping/ShippingFactory";
import { completeTask } from "./taskCompletion";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.OrderMarkAsPayed,
        permissionType: PermissionType.Write
    });
    if (!user) return;

    const params = {...req.query, ...req.body};

    if (!params.orderId)
        return res.status(400).end(
            "No details provided. Please add a body containing orderId or invoiceSecret!"
        );
    const order = await prisma.order.findUnique({
        where: {
            id: params.orderId
        }
    });
    if (!order)
        return res.status(404).end("Order not found!");

    if (req.method === "GET")
        return res.status(200).json(order);

    if (req.method === "PUT") {
        const shipping = JSON.parse(order.shipping);
        await prisma.order.update({
            where: {
                id: params.orderId
            },
            data: {
                shipping: JSON.stringify(ShippingFactory.getShippingInstance({type: shipping.type, data: shipping.data}).getSuccessfulShipping())
            }
        });

        await completeTask(order.id);

        return res.status(200).end("Updated");
    }

    res.status(400).end("Method not allowed");
}
