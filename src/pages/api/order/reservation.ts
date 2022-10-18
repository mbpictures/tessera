import { NextApiRequest, NextApiResponse } from "next";
import { validateOrder } from "../../../constants/serverUtil";
import prisma from "../../../lib/prisma";
import { RecaptchaResultType, verifyToken } from "../../../lib/recaptcha";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "DELETE") {
        const {id} = req.query;
        await prisma.seatReservation.deleteMany({
            where: {
                reservationId: id as string
            }
        });
        return res.status(200).end("Deleted");
    }

    if (req.method === "PUT") {
        const { tickets, id, eventDateId, token } = req.body;
        try {
            const tokenResult = await verifyToken(
                process.env.RECAPTCHA_API_SECRET,
                token,
                process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE && process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE === "true"
            );
            if (tokenResult !== RecaptchaResultType.Success) {
                return res.status(400).json({
                    error: tokenResult
                });
            }

            let validTickets = tickets;
            const [orderValid, invalidTickets] = await validateOrder(tickets, eventDateId, id)
            if (!orderValid) { // quick check to enhance valid order speed
                validTickets = tickets.filter(ticket => !invalidTickets.includes(ticket));
            }

            const expiresAt = new Date();
            expiresAt.setTime(expiresAt.getTime() + 1000 * 60 * 10); // in 10 minutes

            const deleteOp = prisma.seatReservation.deleteMany({
                where: {
                    reservationId: id
                }
            }); // first remove all current
            const createOps = validTickets.map(ticket =>
                prisma.seatReservation.create({
                    data: {
                        ...ticket,
                        expiresAt: expiresAt,
                        reservationId: id,
                        eventDateId: eventDateId
                    }
                })
            ); // then (re-)create all ticket reservations with update expiration date
            await prisma.$transaction([deleteOp, ...createOps]);
            return res.status(200).json({
                validTickets,
                invalidTickets,
                expiresAt: expiresAt.getTime()
            });
        } catch (e) {
            return res.status(500).end("Internal Server error!");
        }
    }
    res.status(405).end("Method Not Allowed");
}
