import { NextApiRequest, NextApiResponse } from "next";
import { IOrder } from "../../../store/reducers/orderReducer";

import Stripe from "stripe";
import prisma from "../../../lib/prisma";
import { calculateTotalPrice } from "../../../constants/util";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2020-08-27"
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { order }: { order: IOrder } = req.body;
        try {
            if (!order.orderId || order.orderId === "") {
                throw new Error("Invalid Order ID");
            }
            if (order.ticketAmount <= 0) {
                throw new Error("Invalid ticket amount");
            }

            const categories = await prisma.category.findMany();
            let amount = calculateTotalPrice(order, categories);
            let currency = categories[0].currency;

            const params: Stripe.PaymentIntentCreateParams = {
                payment_method_types: ["card"],
                amount: Math.floor(amount * 100),
                currency: currency,
                metadata: {
                    orderId: order.orderId
                }
            };
            const payment_intent: Stripe.PaymentIntent =
                await stripe.paymentIntents.create(params);

            await prisma.order.update({
                where: {
                    id: order.orderId
                },
                data: {
                    paymentIntent: JSON.stringify(payment_intent)
                }
            });

            // TODO: add idempotent request key

            res.status(200).json(payment_intent);
        } catch (err) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}
