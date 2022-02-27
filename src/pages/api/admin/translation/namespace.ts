import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export const namespace = async(req: NextApiRequest, res: NextApiResponse) => {
    const {param} = req.query;
    const translations = await prisma.translation.findMany({
        where: {
            namespace: param[0]
        }
    });
    if (req.method === "GET") {
        return res.status(200).json(translations.reduce((result, translation) => ({...result, [translation.key]: translation.translations}), {}));
    }

    if (req.method === "DELETE") {
        await prisma.translation.deleteMany({
            where: {
                namespace: param[0]
            }
        });
        return res.status(200).end("Deleted");
    }

    res.status(400).end("Method unsupported");
}
