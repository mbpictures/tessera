import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

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
                paymentIntent: true,
                paymentResult: true
            }
        });

        // TODO: add payment intent validation using payment factory
        const paymentResultValid = withResult ? order.paymentResult !== null && order.paymentResult !== "" : true;
        res.status(200).json({
            valid: order.paymentIntent !== null && order.paymentIntent !== "" && paymentResultValid
        });
    } catch (e) {
        res.status(500).end("Server error");
    }
}
