import {NextApiRequest, NextApiResponse} from "next";
import {XMLBuilder, XMLParser} from "fast-xml-parser";
import axios from "axios";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const body = req.body;
    const xmlBuilder = new XMLBuilder({});
    const xmlParser = new XMLParser({});

    try {
        const parsed = xmlParser.parse(body);
        // @ts-ignore
        const requestData = xmlBuilder.build({
            transaction_request: [
                {
                    transaction: parsed.status_notification.transaction
                }
            ]
        });

        const response = await axios.post("https://api.sofort.com/api/xml", requestData);
        const parsedResponse = xmlParser.parse(response.data);

        const orderId = parsedResponse.transactions.transaction_details.user_variables.order_id;
        const status = parsedResponse.transactions.transaction_details.status;
        const statusReason = parsedResponse.transactions.transaction_details.status_reason;

        console.log("SOFORT STATUS: " + status);

        if (status === "pending") {
            res.status(200).end();
            return;
        }
        if (status === "loss") {
            // TODO: handle
            res.status(200).end();
            return;
        }
        if (status === "received" || status === "untraceable") {
            // TODO: send email with invoice and optionally tickets
            res.status(200).end();
            return;
        }
        // TODO: handle refunded

        res.status(200).end();
    }
    catch (e) {
        res.status(500).end("Server error");
    }
}
