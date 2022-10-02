import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../../constants/interfaces";
import { getOption, setOption } from "../../../../../lib/options";
import { Options } from "../../../../../constants/Constants";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Options,
        permissionType:
            req.method === "GET" ? PermissionType.Read : PermissionType.Write
    });
    if (!user) return;
    if (req.method !== "GET" && req.method !== "PUT")
        return res.status(400).end("Method unsupported");

    const { param } = req.query;
    if (param.length === 0)
        return res.status(405).end("Missing parameters /{payment|shipping}/{type}");

    const mode = param[0];
    if (mode !== "payment" && mode !== "shipping")
        return res.status(401).end("Invalid mode. Valid modes are payment or shipping");

    const optionType = mode === "payment" ? Options.PaymentFeesPayment : Options.PaymentFeesShipping;
    if (param.length === 1) {
        if (req.method === "GET")
            return res.status(200).json(await getOption(optionType));
        await setOption(optionType, req.body, res);
        return res.status(200).end("Updated");
    }

    const type = param[1];
    if (param.length === 2) {
        const current = await getOption(optionType);
        if (req.method === "GET")
            return res.status(200).end(current[type]);
        current[type] = req.body;
        await setOption(optionType, current, res);
        return res.status(200).end("Updated");
    }
}
