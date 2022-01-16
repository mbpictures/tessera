import {NextApiRequest, NextApiResponse} from "next";
import {PermissionSection, PermissionType, serverAuthenticate} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, {
        permission: PermissionSection.EventCategories,
        permissionType: req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) {
        res.status(401).end("Unauthenticated");
        return;
    }

    if (req.method === "GET") {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
        return;
    }

    if (req.method === "POST") {
        const {label, price, color, activeColor, occupiedColor, currency} = req.body;
        const category = await prisma.category.create({
            data: {
                label: label,
                price: parseFloat(price),
                color: color,
                activeColor: activeColor,
                occupiedColor: occupiedColor,
                currency: currency
            }
        });
        res.status(200).end(category.id.toFixed(0));
    }
}
