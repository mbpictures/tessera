import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getCategoryTicketAmount, getSeatMap } from "../../../constants/serverUtil";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") return res.status(400).end("Method unsupported");
    const { id } = req.query;
    const eventDateId = parseInt(id as string);
    try {
        const event = await prisma.eventDate.findUnique({
            where: {
                id: eventDateId
            },
            select: {
                event: {
                    select: {
                        seatType: true,
                        categories: {
                            select: {
                                category: true,
                                maxAmount: true,
                                categoryId: true
                            }
                        }
                    }
                }
            }
        });
        let seatMap;
        let categoryAmount = event.event.categories.map(cat => cat.category);
        if (event.event.seatType === "free") {
            const ticketAmounts = await getCategoryTicketAmount(eventDateId);
            categoryAmount = event.event.categories.map(category => ({
                ...category.category,
                ticketsLeft: isNaN(category.maxAmount) || !category.maxAmount || category.maxAmount === 0 ? null : Math.max(category.maxAmount - ticketAmounts[category.categoryId], 0)
            }))
        }
        else {
            seatMap = await getSeatMap(eventDateId, true);
        }
        return res.status(200).json({seatMap, categoryAmount});
    } catch (e) {
        return res.status(500).end("Server error");
    }
}
