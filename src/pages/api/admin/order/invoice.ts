import {NextApiRequest, NextApiResponse} from "next";
import { getStaticAssetFile, serverAuthenticate } from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import prisma from "../../../../lib/prisma";
import { generateInvoice } from "../../../../lib/invoice";
import { getOptionData } from "../../../../lib/options";
import { Options } from "../../../../constants/Constants";
import PDFMerger from "pdf-merger-js";

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

    if (req.method === "GET") {
        const pdfs = [];
        const merger = new PDFMerger();
        const orders = await prisma.order.findMany();
        for (const order of orders) {
            const invoiceData = await generateInvoice(
                (await getOptionData(Options.TemplateInvoice, getStaticAssetFile("invoice/template.html", "utf-8"))).data,
                order.id
            );
            pdfs.push(Buffer.from(invoiceData));
            await merger.add(Buffer.from(invoiceData))
        }
        const mergedPdf = await merger.saveAsBuffer();//await merge(pdfs);
        const dataUrl = "data:application/pdf;base64," + mergedPdf.toString("base64");
        return res.status(200).send(dataUrl);
    }

    res.status(405).end("Method not allowed");
}
