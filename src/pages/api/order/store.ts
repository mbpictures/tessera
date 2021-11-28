import {NextApiRequest, NextApiResponse} from "next";
import {IOrder} from "../../../store/reducers/orderReducer";
import {PersonalInformationState} from "../../../store/reducers/personalInformationReducer";
import prisma from "../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
        return;
    }

    const { order, user, eventId, paymentType }: { order: IOrder, user: PersonalInformationState, eventId: number, paymentType: string } = req.body;
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
                shipping: JSON.stringify(user.shipping)
            }
        })
        res.status(200).json({userId: createUser.id, orderId: createOrder.id});
    }
    catch (e) {
        console.log(e)
        res.status(500).end("Server error");
    }
}
