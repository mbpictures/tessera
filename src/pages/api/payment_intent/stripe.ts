import { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";
import prisma from "../../../lib/prisma";
import { calculateTotalPrice, getSeatMap, validateCategoriesWithSeatMap } from "../../../constants/util";
import { withNotification } from "../../../lib/notifications/withNotification";
import { OrderState } from "../../../store/reducers/orderReducer";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2022-08-01"
});

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const { order, paymentMethod = "card" }: { order: OrderState; paymentMethod: string } = req.body;
        try {
            if (!order.orderId || order.orderId === "") {
                throw new Error("Invalid Order ID");
            }
            if (order.tickets.length <= 0) {
                throw new Error("Invalid ticket amount");
            }

            const orderDB = await prisma.order.findUnique({
                where: {
                    id: order.orderId
                },
                select: {
                    tickets: true,
                    event: {
                        select: {
                            seatType: true,
                            seatMap: true
                        }
                    },
                    idempotencyKey: true,
                    paymentIntent: true
                }
            });
            if (orderDB.paymentIntent !== null && orderDB.paymentIntent !== "") {
                return res.status(200).json(JSON.parse(orderDB.paymentIntent));
            }
            const categories = await prisma.category.findMany();
            let amount = calculateTotalPrice(validateCategoriesWithSeatMap(orderDB.tickets, getSeatMap(orderDB.event)), categories);
            let currency = categories[0].currency;

            const params: Stripe.PaymentIntentCreateParams = {
                payment_method_types: [paymentMethod],
                amount: Math.floor(amount * 100),
                currency: currency,
                metadata: {
                    orderId: order.orderId
                }
            };
            const payment_intent: Stripe.PaymentIntent =
                await stripe.paymentIntents.create(
                    params,
                    {
                        idempotencyKey: orderDB.idempotencyKey
                    });

            await prisma.order.update({
                where: {
                    id: order.orderId
                },
                data: {
                    paymentIntent: JSON.stringify(payment_intent)
                }
            });

            res.status(200).json(payment_intent);
        } catch (err) {
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
}

export default withNotification(handler, ["payment_intent", "stripe"]);
