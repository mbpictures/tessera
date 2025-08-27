import {NextApiRequest, NextApiResponse} from "next";
import {serverAuthenticate} from "../../../../constants/serverUtil";
import {PermissionSection, PermissionType} from "../../../../constants/interfaces";
import prisma from "../../../../lib/prisma";
import { generateQRCodeWithId, generateTicketSecret, generateTicketWithId } from "../../../../lib/ticket";

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
                    user: true,
                    eventDate: {
                        include: {
                            event: true
                        }
                    }
                }
            },
            category: true
        }
    });
    if (!ticket)
        return res.status(404).end("No ticket found");

    if (req.method === "GET") {
        return res.status(200).json(ticket);
    }
    if (req.method === "POST") {
        if (ticket.used) {
            return res.status(400).end("Ticket already used");
        }
        if (req.body.secret !== ticket.secret) {
            return res.status(402).end("Ticket Secret invalid");
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
    if (req.method === "PUT") {
        if (req.query.type === "qr") {
            return res.status(200).send((await generateQRCodeWithId(ticket.id)));
        }
        if (req.query.type === "pdf") {
            const data = await generateTicketWithId(ticket.id);
            const dataUrl = "data:application/pdf;base64," + Buffer.from(data).toString("base64");
            return res.status(200).send(dataUrl);
        }
        await generateTicketSecret(ticket.id);
        return res.status(200).end("Secret generated");
    }

    res.status(405).end("Method not allowed");
}
