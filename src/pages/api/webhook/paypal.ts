import { NextApiRequest, NextApiResponse } from "next";
import { send } from "../../../lib/send";
import prisma from "../../../lib/prisma";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "../../../lib/paypal";

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    try {
        const { orderId, paypalId } = req.body;
        const request = new paypal.orders.OrdersCaptureRequest(paypalId);
        request.requestBody({});
        const response = await paypalClient().execute(request);

        if (!response) {
            res.status(500).end("Server Error");
            return;
        }

        // store any result in db
        await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                paymentResult: JSON.stringify(response.result)
            }
        });

        if (response.result.status !== "COMPLETED") {
            res.status(500).end("Payment not completed");
        }

        await send(orderId);

        res.status(200).json({ ...response.result });
    } catch (e) {
        console.log(e);
        res.status(500).json("Server Error");
    }
};

export default handler;
