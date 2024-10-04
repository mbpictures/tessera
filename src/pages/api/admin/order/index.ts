import { NextApiRequest, NextApiResponse } from "next";
import {
    makeOrderDBRequestFromQuery,
    serverAuthenticate
} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import { json2csvAsync } from 'json-2-csv';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Orders,
        permissionType: PermissionType.Read
    });
    if (!user) return;

    if (req.method === "GET") {
        const request = makeOrderDBRequestFromQuery(
            req.query,
            {
                include: {
                    eventDate: {
                        select: {
                            title: true,
                            date: true,
                            event: {
                                select: {
                                    title: true
                                }
                            }
                        }
                    },
                    user: true,
                    tickets: true
                }
            }
        );
        let {exportFile}: any = req.query;

        const orders = await prisma.order.findMany(request);

        if (exportFile && exportFile === "csv") {
            res.setHeader("Content-Type", "text/csv");
            const csv = await json2csvAsync(orders, {
                prependHeader: true,
                emptyFieldValue: ""
            })
            res.status(200).send(csv);
        }

        res.status(200).json(orders);
        return;
    }

    res.status(400).end("Method not allowed");
}
