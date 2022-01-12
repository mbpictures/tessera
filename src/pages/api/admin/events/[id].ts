import {NextApiRequest, NextApiResponse} from "next";
import {serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    const user = await serverAuthenticate(req);
    if (!user) {
        res.status(401).end("Unauthenticated");
        return;
    }

    const {id} = req.query;
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(id as string)
        }
    });

    if (!event) {
        res.status(404).end("Category not found");
        return;
    }


    if (req.method === "GET") {
        res.status(200).json(event);
        return;
    }

    if (req.method === "DELETE") {
        await prisma.event.delete({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).end("Deleted");
        return;
    }

    if (req.method === "PUT") {
        const {title, seatType, seatMapId} = req.body;
        await prisma.event.update({
            where: {
                id: parseInt(id as string)
            },
            data: {
                ...(title && {title: title}),
                ...(seatType && {seatType: seatType}),
                ...(seatMapId && {seatMapId: seatMapId}),
            }
        });
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method unsupported");
}
