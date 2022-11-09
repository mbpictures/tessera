import { NextApiRequest, NextApiResponse } from "next";
import {
    serverAuthenticate
} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.EventCategories,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    if (req.method === "GET") {
        const categories = await prisma.category.findMany();
        res.status(200).json(categories);
        return;
    }

    if (req.method === "POST") {
        const { label, price, color, activeColor, occupiedColor } = req.body;
        const category = await prisma.category.create({
            data: {
                label: label,
                price: parseFloat(price),
                color: color,
                activeColor: activeColor,
                occupiedColor: occupiedColor
            }
        });
        res.status(200).end(category.id.toFixed(0));
    }
}
