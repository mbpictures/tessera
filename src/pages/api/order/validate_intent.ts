import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { PaymentFactory, PaymentType } from "../../../store/factories/payment/PaymentFactory";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const { orderId, withResult }: { orderId: string; withResult?: boolean; } = req.body;
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                paymentType: true,
                paymentIntent: true,
                paymentResult: true
            }
        });

        const paymentInstance = PaymentFactory.getPaymentInstance({type: order.paymentType as PaymentType, data: null});
        const paymentResultValid = withResult ? paymentInstance.paymentResultValid(order.paymentResult) : true;
        res.status(200).json({
            valid: paymentInstance.paymentIntentValid(order.paymentIntent) && paymentResultValid
        });
    } catch (e) {
        res.status(500).end("Server error");
    }
}
