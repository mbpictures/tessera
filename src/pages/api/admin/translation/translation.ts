import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { revalidateEventPages } from "../../../../constants/serverUtil";

export const translation = async(req: NextApiRequest, res: NextApiResponse) => {
    const {param} = req.query;
    const translations = await prisma.translation.findMany({
        where: {
            namespace: param[0],
            key: param[1]
        }
    });
    if (req.method === "GET") {
        if (translations.length === 0)
            return res.status(404).end("Not Found");
        return res.status(200).json(JSON.parse(translations[0].translations));
    }

    if (req.method === "DELETE") {
        await prisma.translation.deleteMany({
            where: {
                namespace: param[0],
                key: param[1]
            }
        });
        await revalidateEventPages(res, ["/", "/information", "/payment", "/checkout"]);
        return res.status(200).end("Deleted");
    }

    if (req.method === "POST") {
        if (translations.length === 0) {
            const translation = await prisma.translation.create({
                data: {
                    namespace: param[0],
                    key: param[1],
                    translations: typeof req.body === "string" ? req.body : JSON.stringify(req.body)
                }
            });
            await revalidateEventPages(res, ["/", "/information", "/payment", "/checkout"]);
            return res.status(200).end(translation.id.toString());
        }

        const newBody = {
            ...(JSON.parse(translations[0].translations)),
            ...req.body
        };
        await prisma.translation.updateMany({
            where: {
                namespace: param[0],
                key: param[1],
            },
            data: {
                translations: JSON.stringify(newBody)
            }
        });
        await revalidateEventPages(res, ["/", "/information", "/payment", "/checkout"]);
        return res.status(200).end("Updated");
    }

    res.status(400).end("Method unsupported");
}
