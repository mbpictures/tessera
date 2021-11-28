import { NextApiRequest, NextApiResponse } from 'next';
import {IOrder} from "../../../store/reducers/orderReducer";

import prisma from "../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { order, paymentResult }: { order: IOrder, paymentResult: string } = req.body;
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
                    paymentResult: paymentResult
                }
            });

            res.status(200).end();
        } catch (err) {
            console.log(err)
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
