import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import { translation } from "./translation";
import { namespace } from "./namespace";

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

    const { param } = req.query;

    if (param.length === 2)
        return await translation(req, res);
    if (param.length === 1)
        return await namespace(req, res);

    res.status(400).end("You need at least one param")
}
