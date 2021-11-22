import { NextApiRequest, NextApiResponse } from 'next';
import {FreeSeatOrder, IOrder} from "../../../store/reducers/orderReducer";

import Stripe from 'stripe';
import prisma from "../../../lib/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27"
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        const { order }: { order: IOrder } = req.body;
        try {
            if (order.ticketAmount <= 0) {
                throw new Error("Invalid ticket amount");
            }

            let amount = 0;
            let currency = "USD";
            if ("orders" in order) {
                const orders = (order as FreeSeatOrder).orders;
                const categories = await prisma.category.findMany({
                    where: {
                        id: {
                            in: orders.map(order => order.categoryId)
                        }
                    }
                });
                amount = orders.reduce((a, order) => a + order.amount * categories.find(category => category.id === order.categoryId).price, 0)
                currency = categories[0].currency;
            }

            const params: Stripe.PaymentIntentCreateParams = {
                payment_method_types: ['card'],
                amount: Math.floor(amount * 100),
                currency: currency,
            };
            const payment_intent: Stripe.PaymentIntent = await stripe.paymentIntents.create(
                params
            );

            // TODO: add idempotent request key

            res.status(200).json(payment_intent);
        } catch (err) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
