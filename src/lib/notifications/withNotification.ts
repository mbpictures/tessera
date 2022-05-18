import { NextApiRequest, NextApiResponse } from "next";
import absoluteUrl from "next-absolute-url";
import { NotificationType } from "./NotificationTypes";

export const withNotification = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown>, type: NotificationType) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
    const result = await handler(req, res);
    const { origin } = absoluteUrl(req);
    if (res.statusCode >= 200 && res.statusCode < 300) {
        fetch(`${origin}/api/admin/notifications/send`, {
            method: "POST",
            body: JSON.stringify({
                req: {
                    body: req.body,
                    cookies: req.cookies,
                    env: req.env,
                    query: req.query,
                    method: req.method,
                    statusCode: req.statusCode,
                    statusMessage: req.statusMessage
                },
                type
            })
        });
    }

    return result;
}
