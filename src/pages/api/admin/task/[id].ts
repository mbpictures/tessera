import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.EventSeatMaps,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    const { id } = req.query;

    const task = await prisma.task.findUnique({
        where: {
            id: parseInt(id as string)
        },
        include: {
            assignedUser: true,
            order: {
                include: {
                    user: true,
                    tickets: {
                        include: {
                            category: true
                        }
                    }
                }
            },
        }
    });

    if (!task) {
        return res.status(404).end("Not found");
    }

    if (req.method === "GET") {
        task.notes = JSON.parse(task.notes);
        return res.status(200).json(task);
    }

    if (req.method === "PUT") {
        const data = req.body;
        if ("notes" in data) {
            data.notes = JSON.stringify(data.notes);
        }
        const newTask = await prisma.task.update({
            where: {
                id: parseInt(id as string)
            },
            data
        });
        return res.status(200).json(newTask);
    }

    return res.status(401).end("Method unsupported");
}
