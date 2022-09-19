import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { sofortApiCall } from "../../../lib/sofort";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import absoluteUrl from "next-absolute-url";
import { withNotification } from "../../../lib/notifications/withNotification";
import { OrderState } from "../../../store/reducers/orderReducer";
import { calculateTotalPrice, getSeatMap, validateCategoriesWithSeatMap } from "../../../constants/util";
import { PaymentType } from "../../../store/factories/payment/PaymentFactory";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const { order }: { order: OrderState } = req.body;
    const xmlBuilder = new XMLBuilder({});
    const xmlParser = new XMLParser({});
    const { origin } = absoluteUrl(req);

    try {
        const orderDB = await prisma.order.findUnique({
            where: {
                id: order.orderId
            },
            select: {
                tickets: true,
                event: {
                    select: {
                        seatType: true,
                        seatMap: true
                    }

                },
                paymentIntent: true,
                paymentType: true
            }
        });

        if (orderDB.paymentIntent !== null && orderDB.paymentIntent !== "" && orderDB.paymentType === PaymentType.Sofort) {
            return res.status(200).json({
                redirectUrl: JSON.parse(orderDB.paymentIntent).payment_url
            });
        }

        const categories = await prisma.category.findMany();
        const totalPrice = calculateTotalPrice(validateCategoriesWithSeatMap(orderDB.tickets, getSeatMap(orderDB.event)), categories);

        const data = {
            multipay: {
                project_id: process.env.SOFORT_PROJECT_ID,
                interface_version: "TicketShop_1.0.0/Sofort_2.3.3",
                amount: totalPrice.toString(),
                reasons: [
                    {
                        reason: "Ticket buy"
                    }
                ],
                user_variables: [
                    {
                        user_variable: order.orderId
                    }
                ],
                success_url: `${origin}/checkout?order=${order.orderId}&payment=sofort`,
                abort_url: `${origin}/payment?order=${order.orderId}`,
                su: "",
                notification_urls: []
            }
        };
        // localhost doesn't work for sofort notification
        if (
            process.env.NODE_ENV === "production" &&
            !req.headers.host.includes("localhost")
        ) {
            data.multipay.notification_urls.push({
                notification_url: `${origin}/api/webhook/sofort`
            });
        }

        // bug in fast-xml-parser typescript declarations
        const sofortRequestData = xmlBuilder.build(data);

        const response = await sofortApiCall(
            "https://api.sofort.com/api/xml",
            sofortRequestData
        );
        const responseXML = xmlParser.parse(response.data);

        await prisma.order.update({
            where: {
                id: order.orderId
            },
            data: {
                paymentIntent: JSON.stringify(responseXML.new_transaction),
                paymentType: PaymentType.Sofort
            }
        });

        return res.status(200).json({
            redirectUrl: responseXML.new_transaction.payment_url
        });
    } catch (e) {
        console.log(e);
        res.status(500).end(e);
    }
}

export default withNotification(handler, ["payment_intent", "sofort"]);
