import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id } = req.query;
    const parsedId = parseInt(id as string);
    if (!id || !parsedId || isNaN(parsedId))
        return res.status(400).end("Please provide an ID!");

    if (req.method !== "GET")
        return res.status(400).end("Method unsupported");

    const seatMap = await prisma.seatMap.findUnique({
        where: {
            id: parsedId
        },
        select: {
            preview: true,
            previewType: true
        }
    });

    if (!seatMap)
        return res.status(404).end("Seat Map not found!");

    if (!seatMap.preview)
        return res.status(400).end("This Seat Map has no preview");

    res.setHeader("Content-Type", seatMap.previewType);
    res.status(200).send(seatMap.preview);
}
