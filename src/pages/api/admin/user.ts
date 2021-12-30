import {NextApiRequest, NextApiResponse} from "next";
import prisma from "../../../lib/prisma";
import {hashPassword, serverAuthenticate} from "../../../constants/serverUtil";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req);
    if (!user) {
        res.status(401).end("Not Authenticated");
        return;
    }
    if (req.method === "POST") {
        try {
            const {username, email, password} = req.body;
            const user = await prisma.adminUser.create({
                data: {
                    userName: username,
                    password: await hashPassword(password),
                    email: email
                }
            });
            res.status(200).json(user);
        } catch (e) {
            res.status(500).end("Server Error");
        }
        return;
    }
    if (req.method === "GET") {
        try {
            const {id} = req.query;
            const user = await prisma.adminUser.findUnique({
                where: {
                    id: parseInt(id as string)
                }
            });
            res.status(200).json(user);
        } catch (e) {
            res.status(500).end("Server Error")
        }
        return;
    }
    if (req.method === "PUT") {
        try {
            const {id, username, email, password} = req.body;
            console.log(req.body);
            const data: any = {
                userName: username,
                email: email,
            };
            if (password)
                data.password = await hashPassword(password);

            await prisma.adminUser.update({
                where: {
                    id: parseInt(id as string)
                },
                data: data
            });

            res.status(200).end("Updated");
        } catch (e) {
            res.status(500).end("Server Error");
        }
        return;
    }
    if (req.method === "DELETE") {
        try {
            const {id} = req.body;
            await prisma.adminUser.delete({
                where: {
                    id: id
                }
            });
            res.status(200).end("Deleted");
        } catch (e) {
            res.status(500).end("Server error");
        }
        return;
    }

    res.status(400).end("Unsupported Method");
}
