import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import {
    IShipping,
    PersonalInformationState
} from "../../../store/reducers/personalInformationReducer";
import countryRegionData from "country-region-data";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        res.status(405).end("Method Not Allowed");
        return;
    }

    const { orderId }: { orderId: string } = req.body;
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                eventDateId: true,
                user: true,
                shipping: true,
                tickets: {
                    select: {
                        categoryId: true,
                        seatId: true,
                        amount: true
                    }
                }
            }
        });

        const country = countryRegionData.find(
            (value) => value.countryShortCode === order.user.countryCode
        );

        const user: PersonalInformationState = {
            address: {
                firstName: order.user.firstName,
                lastName: order.user.lastName,
                address: order.user.address,
                zip: order.user.zip,
                city: order.user.city,
                country: country,
                region: country.regions.find(
                    (value) => value.shortCode === order.user.regionCode
                )
            },
            email: order.user.email,
            userId: order.user.id,
            shipping: JSON.parse(order.shipping) as IShipping,
            customFields: JSON.parse(order.user.customFields),
            serverCustomFields: []
        };

        res.status(200).json({
            user: user,
            order: {orderId, tickets: order.tickets},
            eventDateId: order.eventDateId
        });
    } catch (e) {
        res.status(500).end("Server error");
    }
}
