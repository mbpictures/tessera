import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { PaymentType } from "../../../store/factories/payment/PaymentFactory";
import { send } from "../../../lib/send";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const { orderId }: { orderId: string } = req.body;
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                paymentIntent: true,
                paymentType: true,
                invoiceSent: true
            }
        });
        if (order.paymentIntent === null || order.paymentIntent === "")
            return res.status(400).end("Not a valid order!");
        // as we get instant feedback from PayPal, we don't need to send invoice again
        if (order.paymentType === PaymentType.PayPal || order.paymentIntent == PaymentType.Invoice || order.invoiceSent)
            return res.status(200).end();

        await send(orderId);

        res.status(200).end();
    } catch (e) {
        res.status(500).end("Server error");
    }
}
