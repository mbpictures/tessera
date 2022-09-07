import { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../../lib/prisma";
import { OrderState } from "../../../store/reducers/orderReducer";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const {
            order,
            paymentResult
        }: { order: OrderState; paymentResult: string } = req.body;
        try {
            if (!order.orderId || order.orderId === "") {
                throw new Error("Invalid Order ID");
            }
            if (!paymentResult || paymentResult === "") {
                throw new Error("Invalid Payment Result");
            }

            await prisma.order.update({
                where: {
                    id: order.orderId
                },
                data: {
                    paymentResult: JSON.stringify({ temp: paymentResult })
                }
            });

            res.status(200).end();
        } catch (err) {
            console.log(err);
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
