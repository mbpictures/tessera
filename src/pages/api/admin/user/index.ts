import {NextApiRequest, NextApiResponse} from "next";
import {hashPassword, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const canRegister = (await prisma.adminUser.findMany()).length === 0 && req.method === "POST";
    const user = await serverAuthenticate(req);
    if (!user && !canRegister) {
        res.status(401).end("Not Authenticated");
        return;
    }

    if (req.method === "GET") {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
        return;
    }

    if (req.method === "POST") {
        const {username, email, password} = req.body;
        let additionalData = {};
        if (canRegister) {
            // first user needs to have all rights (otherwise he can't do anything)
            additionalData = {
                readRights: Object.values(PermissionSection).filter(permission => permission !== PermissionSection.None),
                writeRights: Object.values(PermissionSection).filter(permission => permission !== PermissionSection.None),
            }
        }

        const user = await prisma.adminUser.create({
            data: {
                userName: username,
                password: await hashPassword(password),
                email: email,
                ...additionalData
            }
        });
        res.status(200).end(user.id.toFixed(0));
    }

    res.status(400).end("Method unsupported");
}
