import {NextApiRequest, NextApiResponse} from "next";
import {PermissionSection, PermissionType, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, {
        permission: PermissionSection.EventSeatMaps,
        permissionType: req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) {
        res.status(401).end("Unauthenticated");
        return;
    }

    if (req.method === "GET") {
        const seatMaps = await prisma.seatMap.findMany();
        res.status(200).json(seatMaps);
        return;
    }

    if (req.method === "POST") {
        const {definition} = req.body;
        const seatMap = await prisma.seatMap.create({
            data: {
                definition: definition ? JSON.stringify(definition) : ""
            }
        });
        res.status(200).end(seatMap.id.toFixed(0));
    }
}
