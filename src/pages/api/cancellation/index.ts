import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { send } from "../../../lib/send";

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
                userId: true
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
        return res.status(200).end("Order successfully cancelled");
    }
}