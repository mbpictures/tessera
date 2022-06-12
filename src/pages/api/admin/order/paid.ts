import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import {
    PermissionSection,
    PermissionType
} from "../../../../constants/interfaces";
import {
    PaymentFactory,
    PaymentType
} from "../../../../store/factories/payment/PaymentFactory";
import { send } from "../../../../lib/send";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.OrderMarkAsPayed,
        permissionType: PermissionType.Write
    });
    if (!user) return;

    let orders;
    const params = {...req.query, ...req.body};
    if (params.orderId) {
        const order = await prisma.order.findUnique({
            where: {
                id: params.orderId
            }
        });
        orders = [order];
    } else if (params.invoicePurpose) {
        orders = await prisma.order.findMany({
            where: {
                paymentIntent: JSON.stringify({
                    invoicePurpose: params.invoicePurpose
                })
            }
        });
    } else {
        return res.status(400).end(
            "No details provided. Please add a body containing orderId or invoiceSecret!"
        );
    }

    if (req.method === "GET") {
        if (!orders || orders.length === 0)
            return res.status(400).end("No matching order found!");
        return res.status(200).json(orders);
    }

    if (req.method === "PUT") {
        if (params.orderId) {
            if (!orders || orders.length === 0)
                return res.status(404).end("Order not found!");
            await prisma.order.update({
                where: {
                    id: params.orderId
                },
                data: {
                    paymentResult: JSON.stringify(
                        PaymentFactory.getPaymentInstance({
                            type: orders[0].paymentType as PaymentType,
                            data: null
                        }).getValidPaymentResult()
                    )
                }
            });
        } else if (params.invoicePurpose) {
            if (orders.length > 1 && !params.multiple)
                return res.status(400).end(
                    "More than one order matching invoicePurpose! However you can mark both as payed by providing a multiple flag with value true"
                );
            if (orders.length === 0)
                return res.status(400).end("No order matching invoicePurpose found!");

            await Promise.all(
                orders.map(async (order) => {
                    await prisma.order.update({
                        where: {
                            id: order.id
                        },
                        data: {
                            paymentResult: JSON.stringify(
                                PaymentFactory.getPaymentInstance({
                                    type: PaymentType.Invoice,
                                    data: null
                                }).getValidPaymentResult()
                            )
                        }
                    });
                })
            );
        }

        await Promise.all(orders.map(async (order) => {
            await send(order.id);
        }));
        return res.status(200).end("Updated");
    }

    res.status(400).end("Method not allowed");
}
