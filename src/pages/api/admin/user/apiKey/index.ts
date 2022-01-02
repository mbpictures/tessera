import {NextApiRequest, NextApiResponse} from "next";
import {hashPassword, serverAuthenticate} from "../../../../../constants/serverUtil";
import prisma from "../../../../../lib/prisma";
import * as crypto from "crypto";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    const user = await serverAuthenticate(req);
    if (!user) {
        res.status(401).end("Not Authenticated");
        return;
    }

    if (req.method === "POST") {
        try {
            const {name} = req.body;
            const token = crypto.randomUUID();

            await prisma.adminApiKeys.create({
                data: {
                    key: await hashPassword(token),
                    name: name,
                    user: {
                        connect: {
                            email: user.email
                        }
                    }
                },
            });
            res.status(200).json({token: token});
        } catch (e) {
            res.status(500).end("Server error");
        }
    }

    res.status(400).end("Method unsupported");
}
