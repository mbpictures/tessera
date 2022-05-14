import { NotificationHandler } from "./NotificationTypes";
import { EmailNotification } from "./EmailNotification";
import { NotificationHandler as Handler } from "./NotificationHandler";
import { WebMessageNotification } from "./WebMessageNotification";

export class NotificationFactory {
    static getInstance(type: NotificationHandler, user: any, data: any, request: any): Handler {
        if (type === NotificationHandler.Email)
            return new EmailNotification(user, data);
        if (type === NotificationHandler.WebMessage)
            return new WebMessageNotification(user, data, request);
        return null;
    }
}
