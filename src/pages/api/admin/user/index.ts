import {NextApiRequest, NextApiResponse} from "next";
import {hashPassword, serverAuthenticate} from "../../../../constants/serverUtil";
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
        const users = await prisma.user.findMany();
        res.status(200).json(users);
        return;
    }

    if (req.method === "POST") {
        const {username, email, password} = req.body;
        const user = await prisma.adminUser.create({
            data: {
                userName: username,
                password: await hashPassword(password),
                email: email
            }
        });
        res.status(200).end(user.id);
    }

    res.status(400).end("Method unsupported");
}
