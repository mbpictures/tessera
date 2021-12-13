import { NextApiRequest, NextApiResponse } from 'next';
import {send} from "../../../lib/send";
import prisma from "../../../lib/prisma";
import paypal from "@paypal/checkout-server-sdk";
import {paypalClient} from "../../../lib/paypal";

export const handler = async(
    req: NextApiRequest,
    res: NextApiResponse
) => {
    if (req.method !== "POST") {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }
    console.log("WEBHOOK PAYPAL");
    console.log(req.body);

    try {
        const { orderId, paypalId } = req.body;
        const request = new paypal.orders.OrdersCaptureRequest(paypalId);
        request.requestBody({});
        const response = await paypalClient().execute(request);
        if (!response) {
            res.status(500).end("Server Error");
        }

        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                paymentResult: JSON.stringify(response)
            }
        });
        await send(orderId);
        res.json({ ...response.result });
    }
    catch (e) {
        console.log(e);
        res.status(500).json("Server Error");
    }
}
