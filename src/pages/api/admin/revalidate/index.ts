import { NextApiRequest, NextApiResponse } from "next";
import { revalidateBuild, revalidateEventPages, serverAuthenticate } from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Translation,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;

    if (req.method !== "POST") return res.status(400).end("Method not allowed");

    const { events } = req.query;
    if (events)
        await revalidateEventPages(res, req.body);
    else
        await revalidateBuild(res, req.body);

    return res.status(200).end("Revalidated");
}
