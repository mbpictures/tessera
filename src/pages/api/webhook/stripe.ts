import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import getRawBody from "raw-body";
import { send } from "../../../lib/send";
import Cors from "micro-cors";
import prisma from "../../../lib/prisma";
import { withNotification } from "../../../lib/notifications/withNotification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-08-01"
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    try {
        const rawBody = await getRawBody(req);
        const sig = req.headers["stripe-signature"];
        const event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === "charge.succeeded") {
            const orderId = event.data.object["metadata"]["orderId"];
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    paymentResult: JSON.stringify(event)
                }
            });
            await send(orderId);
        }

        res.status(200).json({ received: true });
    } catch (e) {
        res.status(500).json({ received: false });
    }
};

export const config = {
    api: {
        bodyParser: false
    }
};

const cors = Cors({
    allowMethods: ["POST", "HEAD"]
});
export default cors(withNotification(handler, ["webhook", "stripe"]) as any);
