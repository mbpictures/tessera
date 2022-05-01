import { NotificationHandler } from "./NotificationTypes";
import { EmailNotification } from "./EmailNotification";
import { NotificationHandler as Handler } from "./NotificationHandler";

export class NotificationFactory {
    static getInstance(type: NotificationHandler, user: any, data: any): Handler {
        if (type === NotificationHandler.Email)
            return new EmailNotification(user, data);
        return null;
    }
}
