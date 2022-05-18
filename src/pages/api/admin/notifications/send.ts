import { NextApiRequest, NextApiResponse } from "next";
import { sendNotifications } from "../../../../lib/notifications/notifications";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(400).end("Method not allowed");
    req.body = JSON.parse(req.body);
    await sendNotifications(req.body);
    res.status(200).end("Notifications sent");
}
