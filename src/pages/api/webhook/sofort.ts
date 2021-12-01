import {NextApiRequest, NextApiResponse} from "next";
import {XMLBuilder, XMLParser} from "fast-xml-parser";
import axios from "axios";
import requestIp from 'request-ip';
import {sofortApiCall} from "../../../lib/sofort";

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
        const ipAddressResponse = await axios.get("https://www.sofort.com/payment/status/ipList");
        const ipList: Array<string> = ipAddressResponse.data.split("|");
        if (!ipList.includes(requestIp.getClientIp(req))) {
            res.status(400).end("Wrong sender");
            return;
        }
        const parsed = xmlParser.parse(body);
        // @ts-ignore
        const requestData = xmlBuilder.build({
            transaction_request: [
                {
                    transaction: parsed.status_notification.transaction
                }
            ]
        });

        const response = await sofortApiCall("https://api.sofort.com/api/xml", requestData);
        const parsedResponse = xmlParser.parse(response.data);

        const orderId = parsedResponse.transactions.transaction_details.user_variables.user_variable;
        const status = parsedResponse.transactions.transaction_details.status;
        const statusReason = parsedResponse.transactions.transaction_details.status_reason;

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
