import {NextApiRequest, NextApiResponse} from "next";
import {send} from "../../../lib/send";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const {orderId} = req.body;
    try {
        await send(orderId);
        res.status(200).end("Email Send");
    }
    catch (e) {
        console.log(e);
        res.status(500).end("Server error");
    }
}
