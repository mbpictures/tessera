import { NextApiRequest, NextApiResponse } from "next";
import {
    hashPassword,
    serverAuthenticate
} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const canRegister =
        (await prisma.adminUser.findMany()).length === 0 &&
        req.method === "POST";
    const user = await serverAuthenticate(
        req,
        res,
        {
            permission: PermissionSection.UserManagement,
            permissionType:
                req.method === "GET"
                    ? PermissionType.Read
                    : PermissionType.Write
        },
        false
    );
    if (!user && !canRegister) {
        res.status(401).end("Not Authenticated");
        return;
    }

    if (req.method === "GET") {
        let users = await prisma.adminUser.findMany();
        users = users.map(user => ({...user, writeRights: JSON.parse(user.writeRights), readRights: JSON.parse(user.readRights)}))
        res.status(200).json(users);
        return;
    }

    if (req.method === "POST") {
        const { username, email, password } = req.body;

        const adminUser = await prisma.adminUser.findMany({
            where: {
                OR: [
                    {
                        email: email
                    },
                    {
                        userName: username
                    }
                ]
            }
        });
        if (adminUser.length > 0) {
            res.status(400).end("Username and email have to be unique!");
            return;
        }

        let additionalData = {
            readRights: JSON.stringify([]),
            writeRights: JSON.stringify([])
        };
        if (canRegister) {
            // first user needs to have all rights (otherwise he can't do anything)
            additionalData = {
                readRights: JSON.stringify(Object.values(PermissionSection).filter(
                    (permission) => permission !== PermissionSection.None
                )),
                writeRights: JSON.stringify(Object.values(PermissionSection).filter(
                    (permission) => permission !== PermissionSection.None
                ))
            };
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
        return;
    }

    res.status(400).end("Method unsupported");
}
