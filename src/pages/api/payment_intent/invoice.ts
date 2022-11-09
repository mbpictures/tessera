import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { OrderState } from "../../../store/reducers/orderReducer";
import { send } from "../../../lib/send";
import { withNotification } from "../../../lib/notifications/withNotification";
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

    try {
        const orderDB = await prisma.order.findUnique({
            where: {
                id: order.orderId
            },
            select: {
                paymentIntent: true,
                paymentType: true
            }
        });
        if (orderDB.paymentIntent === null || orderDB.paymentIntent === "" || orderDB.paymentType !== PaymentType.Invoice) {
            const secret = Math.random().toString(36).substring(2, 8).toUpperCase();
            await prisma.order.update({
                where: {
                    id: order.orderId
                },
                data: {
                    paymentIntent: JSON.stringify({ invoicePurpose: secret }),
                    paymentType: PaymentType.Invoice
                }
            });
        }

        await send(order.orderId);

        res.status(200).end();
    } catch (e) {
        console.log(e);
        res.status(500).end("Server error");
    }
}

export default withNotification(handler, ["payment_intent", "invoice"]);
