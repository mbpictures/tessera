import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import {send} from "../../../lib/send";
import Cors from 'micro-cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27"
});

const handler = async(
    req: NextApiRequest,
    res: NextApiResponse
) => {
    if (req.method !== "POST") {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    try {
        const rawBody = await getRawBody(req);
        const sig = req.headers["stripe-signature"];
        const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);

        if (event.type === "charge.succeeded") {
            console.log(event.data.object["metadata"]["orderId"]);
            setTimeout(async () => {
                // await send();
            }, 0);
        }

        res.status(200).json({received: true});
    }
    catch (e) {
        res.status(500).json({received: false});
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};

const cors = Cors({
    allowMethods: ['POST', 'HEAD'],
});
export default cors(handler as any);