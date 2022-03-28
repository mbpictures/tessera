import {NextApiRequest, NextApiResponse} from "next";
import {serverAuthenticate} from "../../../../constants/serverUtil";
import {PermissionSection, PermissionType} from "../../../../constants/interfaces";
import prisma from "../../../../lib/prisma";

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
    if (typeof id !== "string")
        return res.status(400);

    const ticket = await prisma.ticket.findUnique({
        where: {
            id: id
        },
        include: {
            order: {
                include: {
                    user: true
                }
            }
        }
    });
    if (!ticket)
        return res.status(404).end("No ticket found");

    if (req.method === "GET") {
        return res.status(200).json(ticket);
    }
    if (req.method === "PUT") {
        if (ticket.used) {
            return res.status(400).end("Ticket already used");
        }
        await prisma.ticket.update({
            where: {
                id: id
            },
            data: {
                used: true
            }
        });
        return res.status(200).end("Updated")
    }

    res.status(405).end("Method not allowed");
}