import {NextApiRequest, NextApiResponse} from "next";
import {serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req);
    if (!user) {
        res.status(401).end("Unauthenticated");
        return;
    }

    if (req.method === "GET") {
        const events = await prisma.event.findMany();
        res.status(200).json(events);
        return;
    }

    if (req.method === "POST") {
        const {title, seatType} = req.body;
        const seatMap = await prisma.event.create({
            data: {
                title: title,
                seatType: seatType
            }
        });
        res.status(200).end(seatMap.id.toFixed(0));
    }
}
