import { NextApiRequest, NextApiResponse } from "next";
import { validateOrder } from "../../../constants/serverUtil";
import prisma from "../../../lib/prisma";
import { RecaptchaResultType, verifyToken } from "../../../lib/recaptcha";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PUT") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }
    const {tickets, id, eventDateId, token} = req.body;
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

        let invalidTickets = [];
        let validTickets = tickets;
        if (!(await validateOrder(tickets, eventDateId, id))) { // quick check to enhance valid order speed
            validTickets = [];
            for (let ticket of tickets) {
                if (await validateOrder([ticket], eventDateId, id))
                    validTickets.push(ticket);
                else
                    invalidTickets.push(ticket);
            }
        }

        const expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + 1000 * 60 * 10); // in 10 minutes

        const deleteOp = prisma.seatReservation.deleteMany({
            where: {
                reservationId: id
            }
        }); // first remove all current
        const createOp = prisma.seatReservation.createMany({
            data: validTickets.map(ticket => ({...ticket, expiresAt: expiresAt, reservationId: id, eventDateId: eventDateId}))
        }); // then (re-)create all ticket reservations with update expiration date
        await prisma.$transaction([deleteOp, createOp]);
        return res.status(200).json({
            validTickets,
            invalidTickets,
            expiresAt: expiresAt.getTime()
        });
    } catch (e) {
        return res.status(500).end("Internal Server error!");
    }
}
