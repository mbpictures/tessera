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
        permission: PermissionSection.EventSeatMaps,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    const { id } = req.query;
    const seatMap = await prisma.seatMap.findUnique({
        where: {
            id: parseInt(id as string)
        },
        include: {
            events: true
        }
    });

    if (!seatMap) {
        res.status(404).end("Category not found");
        return;
    }

    if (req.method === "GET") {
        res.status(200).json(seatMap);
        return;
    }

    if (req.method === "DELETE") {
        if (seatMap.events.length > 0) {
            res.status(400).end("Category is in use by events!");
            return;
        }
        await prisma.seatMap.delete({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).end("Deleted");
        return;
    }

    if (req.method === "PUT") {
        const { definition } = req.body;
        await prisma.seatMap.update({
            where: {
                id: parseInt(id as string)
            },
            data: {
                ...(definition && { definition: JSON.stringify(definition) })
            }
        });
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method unsupported");
}
