import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { paypalClient } from "../../../lib/paypal";
import paypal from "@paypal/checkout-server-sdk";
import { calculateTotalPrice, getSeatMap, validateCategoriesWithSeatMap } from "../../../constants/util";
import { withNotification } from "../../../lib/notifications/withNotification";
import { OrderState } from "../../../store/reducers/orderReducer";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
    }
    const { order }: { order: OrderState } = req.body;

    try {
        if (!order.orderId || order.orderId === "") {
            throw new Error("Invalid Order ID");
        }
        if (order.tickets.length <= 0) {
            throw new Error("Invalid ticket amount");
        }

        const categories = await prisma.category.findMany();
        const orderDB = await prisma.order.findUnique({
            where: {
                id: order.orderId
            },
            select: {
                event: {
                    select: {
                        seatType: true,
                        seatMap: true
                    }
                },
                tickets: true,
                paymentIntent: true
            }
        });

        if (orderDB.paymentIntent !== null && orderDB.paymentIntent !== "") {
            res.status(200).json({ orderId: JSON.parse(orderDB.paymentIntent).id });
        }

        let amount = calculateTotalPrice(validateCategoriesWithSeatMap(orderDB.tickets, getSeatMap(orderDB.event)), categories);
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
