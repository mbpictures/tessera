import {NextApiRequest, NextApiResponse} from "next";
import {hashPassword, PermissionSection, PermissionType, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import {compare} from 'bcryptjs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
){
    const user = await serverAuthenticate(req, {
        permission: PermissionSection.UserManagement,
        permissionType: req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) {
        res.status(401).end("Unauthenticated");
        return;
    }

    const {id} = req.query;
    const adminUser = await prisma.adminUser.findUnique({
        where: {
            id: parseInt(id as string)
        }
    });

    if (!adminUser) {
        res.status(404).end("Category not found");
        return;
    }


    if (req.method === "GET") {
        res.status(200).json(user);
        return;
    }

    if (req.method === "DELETE") {
        await prisma.adminUser.delete({
            where: {
                id: parseInt(id as string)
            }
        });
        res.status(200).end("Deleted");
    }

    if (req.method === "PUT") {
        const {username, email, password, oldPassword} = req.body;
        const data: any = {
            userName: username,
            email: email,
        };
        if (password) {
            const current = await prisma.adminUser.findUnique({
                where: {
                    id: parseInt(id as string)
                }
            });
            if (!await compare(oldPassword, current.password)) {
                res.status(401).end("Current Password doesn't match");
                return;
            }
            data.password = await hashPassword(password);
        }

        await prisma.adminUser.update({
            where: {
                id: parseInt(id as string)
            },
            data: data
        });

        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method unsupported");
}
