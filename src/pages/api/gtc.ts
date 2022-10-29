import { NextApiRequest, NextApiResponse } from "next";
import { Options } from "../../constants/Constants";
import { getOptionData } from "../../lib/options";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET")
        return res.status(400).end("Method unsupported");

    const {type: gtcType} = req.query;

    const { data, type } = await getOptionData(gtcType === "privacy" ? Options.Privacy : Options.GTC);
    if (!data)
        return res.status(404).end("No GTC set");

    res.setHeader("Cache-Control", "s-maxage=86400");
    res.setHeader("Content-Type", type);
    res.status(200).send(data);
}
