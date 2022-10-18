import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "DELETE") {
        return res.status(400).end("Method not supported");
    }

    await prisma.seatReservation.deleteMany({
        where: {
            expiresAt: {
                lt: new Date()
            }
        }
    });
    return res.status(200).end("Cleared");
}
