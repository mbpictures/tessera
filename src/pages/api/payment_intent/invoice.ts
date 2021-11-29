import {NextApiRequest, NextApiResponse} from "next";
import prisma from "../../../lib/prisma";
import {IOrder} from "../../../store/reducers/orderReducer";

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

    try {
        const secret = Math.random().toString(36).substring(2, 8).toUpperCase();
        await prisma.order.update({
            where: {
                id: order.orderId
            },
            data: {
                paymentIntent: JSON.stringify({invoicePurpose: secret})
            }
        });

        res.status(200).end();
    }
    catch (e) {
        res.status(500).end("Server error");
    }
}
