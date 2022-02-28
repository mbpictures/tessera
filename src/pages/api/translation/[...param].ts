import { NextApiRequest, NextApiResponse } from "next";
import i18nConfig from "../../../../i18n";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET")
        return res.status(400).end("Method unsupported");
    const { param } = req.query;
    if ((param?.length ?? 0) < 2)
        return res.status(400).end("Namespace or locale missing");

    return res.status(200).json(await i18nConfig.loadLocaleFrom(param[1], param[0]));
}
