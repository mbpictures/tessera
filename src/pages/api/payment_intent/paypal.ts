import { NextApiRequest, NextApiResponse } from "next";
import { IOrder } from "../../../store/reducers/orderReducer";
import prisma from "../../../lib/prisma";
import { paypalClient } from "../../../lib/paypal";
import paypal from "@paypal/checkout-server-sdk";
import { calculateTotalPrice } from "../../../constants/util";
import { withNotification } from "../../../lib/notifications/withNotification";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
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

        let request = new paypal.orders.OrdersCreateRequest();
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: amount.toFixed(2)
                    }
                }
            ]
        });

        const response = await paypalClient().execute(request);

        await prisma.order.update({
            where: {
                id: order.orderId
            },
            data: {
                paymentIntent: JSON.stringify(response.result)
            }
        });

        res.status(200).json({ orderId: response.result.id });
    } catch (err) {
        console.log(err);
        res.status(500).end("Server error");
    }
}

export default withNotification(handler, ["payment_intent", "paypal"]);
