import { NextApiRequest, NextApiResponse } from "next";
import {
    revalidateBuild,
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
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    if (req.method === "GET") {
        const events = await prisma.event.findMany();
        res.status(200).json(events);
        return;
    }

    if (req.method === "POST") {
        const { title, seatType } = req.body;
        const seatMap = await prisma.event.create({
            data: {
                title: title,
                seatType: seatType
            }
        });
        await revalidateBuild(res, ["/", "/payment"]);
        return res.status(200).end(seatMap.id.toFixed(0));
    }

    res.status(403).end("Method not allowed");
}
