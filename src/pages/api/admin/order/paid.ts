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

    if (req.method === "PUT") {
        const { orderId, invoicePurpose, multiple } = req.body;
        let orders;
        if (orderId) {
            const order = await prisma.order.findUnique({
                where: {
                    id: orderId
                }
            });
            if (!order) {
                res.status(404).end("Order not found!");
                return;
            }
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    paymentResult: JSON.stringify(
                        PaymentFactory.getPaymentInstance({
                            type: order.paymentType as PaymentType,
                            data: null
                        }).getValidPaymentResult()
                    )
                }
            });
            orders = [order];
        } else if (invoicePurpose) {
            orders = await prisma.order.findMany({
                where: {
                    paymentIntent: JSON.stringify({
                        invoicePurpose: invoicePurpose
                    })
                }
            });
            if (orders.length > 1 && !multiple) {
                res.status(400).end(
                    "More than one order matching invoicePurpose! However you can mark both as payed by providing a multiple flag with value true"
                );
                return;
            }
            if (orders.length === 0) {
                res.status(400).end("No order matching invoicePurpose found!");
                return;
            }

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
        } else {
            res.status(400).end(
                "No update details provided. Please add a body containing orderId or invoiceSecret!"
            );
            return;
        }

        await Promise.all(orders.map(async (order) => {
            await send(order.id);
        }));
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method not allowed");
}
