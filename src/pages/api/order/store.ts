import { NextApiRequest, NextApiResponse } from "next";
import { IOrder } from "../../../store/reducers/orderReducer";
import { PersonalInformationState } from "../../../store/reducers/personalInformationReducer";
import prisma from "../../../lib/prisma";
import { withNotification } from "../../../lib/notifications/withNotification";
import { PaymentType } from "../../../store/factories/payment/PaymentFactory";
import { ShippingType } from "../../../store/factories/shipping/ShippingFactory";

async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const {
        order,
        user,
        eventId,
        paymentType,
        locale
    }: {
        order: IOrder;
        user: PersonalInformationState;
        eventId: number;
        paymentType: string;
        locale: string;
    } = req.body;
    try {
        const createUser = await prisma.user.create({
            data: {
                firstName: user.address.firstName,
                lastName: user.address.lastName,
                email: user.email,
                address: user.address.address,
                zip: user.address.zip,
                city: user.address.city,
                countryCode: user.address.country.countryShortCode,
                regionCode: user.address.region.shortCode
            }
        });

        const createOrder = await prisma.order.create({
            data: {
                order: JSON.stringify(order),
                event: {
                    connect: {
                        id: eventId
                    }
                },
                paymentType: paymentType,
                user: {
                    connect: {
                        id: createUser.id
                    }
                },
                shipping: JSON.stringify(user.shipping),
                locale: locale
            }
        });

        // TODO: replace hard coded types by factory methods
        if (paymentType === PaymentType.Invoice || user.shipping.type === ShippingType.Post) {
            await prisma.task.create({
                data: {
                    order: {
                        connect: {
                            id: createOrder.id
                        }
                    }
                }
            });
        }

        res.status(200).json({
            userId: createUser.id,
            orderId: createOrder.id
        });
    } catch (e) {
        console.log(e);
        res.status(500).end("Server error");
    }
}

export default withNotification(handler, ["order", "store"]);
