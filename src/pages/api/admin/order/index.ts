import {NextApiRequest, NextApiResponse} from "next";
import {PermissionSection, PermissionType, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, {
        permission: PermissionSection.EventManagement,
        permissionType: PermissionType.Read
    });
    if (!user) {
        res.status(401).end("Unauthorized");
        return;
    }

    if (req.method === "GET") {
        const orders = await prisma.order.findMany();
        res.status(200).json(orders);
        return;
    }

    res.status(400).end("Method not allowed");
}
