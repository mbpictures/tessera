import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { send } from "../../../lib/send";
import { PaymentFactory, PaymentType } from "../../../store/factories/payment/PaymentFactory";
import { calculateTotalPrice } from "../../../constants/util";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {orderId, secret} = req.query;
    if (!orderId || !secret)
        return res.status(400).end("Missing orderId or secret");

    const order = await prisma.order.findUnique({
        where: {
            id: orderId as string
        },
        select: {
            tickets: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    category: {
                        select: {
                            label: true,
                            price: true
                        }
                    },
                    seatId: true
                }
            },
            cancellationSecret: true
        }
    });
    if (!order)
        return res.status(404).end("Order not found");
    if (order.cancellationSecret !== (secret as string))
        return res.status(401).end("Unauthorized");
    if (req.method === "GET") {
        return res.status(200).json(order.tickets);
    }
    if (req.method === "POST") {
        const {tickets} = req.body;
        for (let ticketId of tickets) {
            await prisma.ticket.delete({
                where: {
                    id: ticketId
                }
            });
        }

        await send(orderId);
        const count = await prisma.order.findUnique({
            where: {
                id: orderId as string
            },
            select: {
                tickets: {
                    select: {
                        id: true
                    }
                },
                task: {
                    select: {
                        id: true
                    }
                },
                userId: true,
                paymentType: true,
                paymentResult: true,
                paymentIntent: true
            }
        });
        const ticketsDB = await prisma.ticket.findMany({
            where: {
                id: {
                    in: tickets
                }
            }
        });
        const refund = await prisma.refund.create({
            data: {
                paymentResult: count.paymentResult,
                paymentType: count.paymentType,
                paymentIntent: count.paymentIntent,
                ticketsRefunded: tickets.length,
                refundAmount: calculateTotalPrice(ticketsDB, (await prisma.category.findMany()))
            }
        });
        if (count.tickets.length === 0) {
            if (count.task)
                await prisma.task.delete({
                    where: {
                        id: count.task.id
                    }
                });
            await prisma.order.delete({
                where: {
                    id: orderId as string
                }
            })
            await prisma.user.delete({
                where: {
                    id: count.userId
                }
            });
        }
        else {
            await prisma.order.update({
                where: {
                    id: orderId as string
                },
                data: {
                    refundId: refund.id
                }
            });
        }
        // user has paid, so we need to initiate refund
        const paymentInstance = PaymentFactory.getPaymentInstance({type: count.paymentType as PaymentType, data: null})
        if (paymentInstance?.paymentResultValid(count.paymentResult)) {
            if (paymentInstance.needsManualProcessing()) {
                await prisma.task.create({
                    data: {
                        notes: "[]",
                        order: null,
                        refund: {
                            connect: {
                                id: refund.id
                            }
                        }
                    }
                });
            }
            else {
                // TODO: auto refund of paypal, sofort and stripe
            }
        }
        return res.status(200).end("Order successfully cancelled");
    }
}
