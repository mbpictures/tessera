import {NextApiRequest, NextApiResponse} from "next";
import {serverAuthenticate} from "../../../../../constants/serverUtil";
import prisma from "../../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    const user = await serverAuthenticate(req);
    if (!user) {
        res.status(401).end("Not Authenticated");
        return;
    }
    const {id} = req.query;
    const apiKey = await prisma.adminApiKeys.findUnique({
        where: {
            id: parseInt(id as string)
        },
        include: {
            user: true
        }
    });

    if (user.email !== apiKey.user.email) {
        res.status(400).end("Can not manipulate api keys of other users!");
        return;
    }

    if (req.method === "DELETE") {
        await prisma.adminApiKeys.delete({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).end("Deleted");
        return;
    }

    res.status(400).end("Method unsupported");
}
