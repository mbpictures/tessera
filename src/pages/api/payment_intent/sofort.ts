import {NextApiRequest, NextApiResponse} from "next";
import prisma from "../../../lib/prisma";
import {IOrder} from "../../../store/reducers/orderReducer";
import {sofortApiCall} from "../../../lib/sofort";
import {XMLBuilder, XMLParser} from "fast-xml-parser";
import absoluteUrl from 'next-absolute-url';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const { order }: { order: IOrder } = req.body;
    const xmlBuilder = new XMLBuilder({});
    const xmlParser = new XMLParser({});
    const { origin } = absoluteUrl(req);

    try {
        const data = {
            multipay: {
                project_id: process.env.SOFORT_PROJECT_ID,
                interface_version: "TicketShop_1.0.0/Sofort_2.3.3",
                amount: order.totalPrice.toString(),
                reasons: [
                    {
                        reason: "Ticket buy"
                    }
                ],
                success_url: `${origin}/checkout?order=${order.orderId}`,
                abort_url: `${origin}/payment?order=${order.orderId}`,
                su: "",
                notification_urls: []
            }
        };
        // localhost doesnt work for sofort notifiaction
        if (process.env.NODE_ENV === 'production' && !req.headers.host.includes("localhost")){
            data.multipay.notification_urls.push({notification_url: `${origin}/api/webhook/sofort`});
        }

        // bug in fast-xml-parser typescript declarations
        // @ts-ignore
        const sofortRequestData = xmlBuilder.build(data);

        const response = await sofortApiCall("https://api.sofort.com/api/xml", sofortRequestData);
        const responseXML = xmlParser.parse(response.data);

        await prisma.order.update({
            where: {
                id: order.orderId
            },
            data: {
                paymentIntent: JSON.stringify({transactionID: responseXML.new_transaction.transaction})
            }
        });

        res.status(200).json({redirectUrl: responseXML.new_transaction.payment_url});
    }
    catch (e) {
        console.log(e);
        res.status(500).end(e);
    }
}
