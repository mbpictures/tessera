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

    if (req.method !== "POST")
        return res.status(400).end("Method not allowed");

    const {type, data} = req.body;
    await prisma.notification.create({
        data: {
            type: type,
            data: JSON.stringify(data),
            user: {
                connect: {
                    email: user.email
                }
            }
        }
    });

    res.status(200).end("Created");
}
