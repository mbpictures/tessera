import { NextApiRequest, NextApiResponse } from "next";
import {
    serverAuthenticate
} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import { json2csvAsync } from 'json-2-csv';

function setProperty(object, path, value) {
    const pList = path.split(".");
    const len = pList.length;
    for(let i = 0; i < len-1; i++) {
        const elem = pList[i];
        if( !object[elem] ) object[elem] = {}
        object = object[elem];
    }

    object[pList[len-1]] = value;
    return object;
}


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
        const request = {
            include: {
                eventDate: {
                    select: {
                        title: true,
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
        let {page, amount, shipping, eventId, event, payment, customerFirstName, customerLastName, sorting, exportFile}: any = req.query;

        if (amount) {
            request["take"] = parseInt(amount as string);
            if (page)
                request["skip"] = parseInt(page as string) * parseInt(amount as string);
        }
        if (shipping) {
            setProperty(request, "where.shipping.contains", `"type":"${shipping}"`);
        }
        if (eventId) {
            setProperty(request, "where.eventId", parseInt(eventId));
        }
        if (event) {
            setProperty(request, "where.event.title", event);
        }
        if (payment) {
            setProperty(request, "where.paymentType", payment);
        }
        if (customerFirstName) {
            setProperty(request, "where.user.firstName.contains", customerFirstName);
        }
        if (customerLastName) {
            setProperty(request, "where.user.lastName.contains", customerLastName);
        }
        if (sorting) {
            sorting = decodeURIComponent(sorting);
            setProperty(request, "orderBy", sorting.split(",").map(sort => {
                const split = sort.split(":");
                const result = {};
                setProperty(result, split[0], split[1]);
                return result;
            }));
        }

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
