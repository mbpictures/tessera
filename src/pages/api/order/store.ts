import { NextApiRequest, NextApiResponse } from "next";
import { OrderState } from "../../../store/reducers/orderReducer";
import { PersonalInformationState } from "../../../store/reducers/personalInformationReducer";
import prisma from "../../../lib/prisma";
import { withNotification } from "../../../lib/notifications/withNotification";
import { PaymentType } from "../../../store/factories/payment/PaymentFactory";
import { ShippingType } from "../../../store/factories/shipping/ShippingFactory";
import { validateOrder } from "../../../constants/serverUtil";

const createOrder = async (eventDateId, paymentType, user, locale, idempotencyKey) => {
    return await prisma.order.create({
        data: {
            eventDate: {
                connect: {
                    id: eventDateId
                }
            },
            paymentType: paymentType,
            user: {
                create: {
                    firstName: user.address.firstName,
                    lastName: user.address.lastName,
                    email: user.email,
                    address: user.address.address,
                    zip: user.address.zip,
                    city: user.address.city,
                    countryCode: user.address.country.countryShortCode,
                    regionCode: user.address.region.shortCode
                }
            },
            shipping: JSON.stringify(user.shipping),
            locale: locale,
            idempotencyKey: idempotencyKey
        },
        include: {
            user: true,
            tickets: true,
            task: true
        }
    });
}

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
        eventDateId,
        paymentType,
        locale
    }: {
        order: OrderState;
        user: PersonalInformationState;
        eventDateId: number;
        paymentType: string;
        locale: string;
    } = req.body;
    const idempotencyKey = req.headers["idempotency-key"] as string;
    try {
        if (!idempotencyKey)
            return res.status(410).end("Idempotency Key missing");
        // users may try to cheat their order using postman or some other interceptor, we need to check server side
        if (!(await validateOrder(order.tickets, eventDateId, order.reservationId)))
            return res.status(411).end("Order not valid");
        let orderDB = await prisma.order.findUnique({
            where: {
                idempotencyKey: idempotencyKey
            },
            include: {
                tickets: true,
                user: true,
                task: true
            }
        });
        // order and user already created and identified by idempotency key?
        if (orderDB === null) {
            orderDB = await createOrder(eventDateId, paymentType, user, locale, idempotencyKey);
        }
        if (!orderDB.tickets || orderDB.tickets.length === 0) {
            // we want to make sure, that either all or none ticket is created
            await prisma.$transaction(order.tickets
                .map(ticket => ({...ticket, used: false, orderId: orderDB.id}))
                .map((ticket) => {
                    return prisma.ticket.create({
                        data: ticket
                    })
                })
            );
        }

        // TODO: replace hard coded types by factory methods
        if (orderDB.task === null && (paymentType === PaymentType.Invoice || user.shipping.type === ShippingType.Post)) {
            await prisma.task.create({
                data: {
                    order: {
                        connect: {
                            id: orderDB.id
                        }
                    },
                    notes: "[]"
                }
            });
        }

        res.status(200).json({
            userId: orderDB.user.id,
            orderId: orderDB.id
        });
    } catch (e) {
        console.log(e);
        res.status(500).end("Server error");
    }
}

export default withNotification(handler, ["order", "store"]);
