import {NextApiRequest, NextApiResponse} from "next";
import {generateInvoice} from "../../../lib/invoice";
import * as fs from "fs";
import * as pathA from "path";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        const path = pathA.join(process.cwd(), 'src/assets/invoice/template.html');
        const template = fs.readFileSync(path, 'utf-8');
        res.status(200).end(await generateInvoice(template, "2ca8fe12-edd3-43ea-b02d-d710b1f71ac2"));
    }
    catch (e) {
        console.log(e);
        res.status(500).end("Server error");
    }
}
