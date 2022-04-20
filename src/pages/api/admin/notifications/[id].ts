import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.None,
        permissionType: PermissionType.Read
    });
    if (!user) return;

    const notificationId = parseInt(req.query.id as string);
    const notification = await prisma.notification.findUnique({
        where: {
            id: notificationId
        },
        select: {
            user: true
        }
    });

    if (notification === null)
        return res.status(404).end("Not found");

    if (user.email !== notification.user.email)
        return res.status(401).end("Can not manipulate foreign notifications");

    if (req.method === "DELETE") {
        await prisma.notification.delete({
            where: {
                id: notificationId
            }
        });

        return res.status(200).end("Deleted");
    }

    if (req.method === "PUT") {
        const { type, data } = req.body;
        await prisma.notification.update({
            where: {
                id: notificationId
            },
            data: {
                type: type,
                data: JSON.stringify(data)
            }
        });

        return res.status(200).end("Updated")
    }
    return res.status(400).end("Method not allowed");
}
