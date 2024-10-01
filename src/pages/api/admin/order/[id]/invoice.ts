import {NextApiRequest, NextApiResponse} from "next";
import { getStaticAssetFile, serverAuthenticate } from "../../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../../constants/interfaces";
import prisma from "../../../../../lib/prisma";
import { generateInvoice } from "../../../../../lib/invoice";
import { getOptionData } from "../../../../../lib/options";
import { Options } from "../../../../../constants/Constants";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Orders,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    const { id } = req.query;
    if (typeof id !== "string")
        return res.status(400);

    const order = await prisma.order.findUnique({
        where: {
            id: id
        },
    });
    if (!order)
        return res.status(404).end("No ticket found");

    if (req.method === "GET") {
        const invoiceData = await generateInvoice(
            (await getOptionData(Options.TemplateInvoice, getStaticAssetFile("invoice/template.html", "utf-8"))).data,
            id
        );
        const dataUrl = "data:application/pdf;base64," + Buffer.from(invoiceData).toString("base64");
        return res.status(200).send(dataUrl);
    }

    res.status(405).end("Method not allowed");
}
