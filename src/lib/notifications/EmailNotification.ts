import { NotificationHandler } from "./NotificationHandler";
import { getEmailTransporter } from "../email";

export class EmailNotification implements NotificationHandler {
    private user: any;
    private data: any;

    constructor(user, data) {
        this.user = user;
        this.data = data;
    }

    async sendNotification(): Promise<void> {
        const message: any = {
            from: process.env.EMAIL_SENDER,
            to: this.user.email,
            subject: `Ticketshop - Notification ${this.data.serviceType[0]} ${this.data.serviceType[1]}`,
            html: `Hi ${this.user.userName},<br />You are receiving this email, because you subscribed to E-Mail notifications on your ticket shop.<br /><br />Notification Type: ${this.data.serviceType[0]}<br />Service: ${this.data.serviceType[1]}`
        };

        (await getEmailTransporter()).sendMail(message);
    }
}
