import { NextApiRequest, NextApiResponse } from "next";
import {
    serverAuthenticate
} from "../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import { getOption, setOption } from "../../../../lib/options";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Options,
        permissionType: PermissionType.Read
    });
    if (!user) return;

    const { key } = req.body;
    if (!key) {
        res.status(400).end("Please provide an option key!");
        return;
    }

    if (req.method === "GET") {
        res.status(200).json({value: await getOption(key)});
        return;
    }

    if (req.method === "POST") {
        const { value } = req.body;
        await setOption(key, value, res);
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method not allowed");
}
