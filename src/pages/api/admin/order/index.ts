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
        const orders = await prisma.order.findMany();
        res.status(200).json(orders);
        return;
    }

    res.status(400).end("Method not allowed");
}
