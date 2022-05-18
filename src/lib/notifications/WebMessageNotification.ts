import { NotificationHandler } from "./NotificationHandler";

export class WebMessageNotification implements NotificationHandler {
    private user: any;
    private data: any;
    private request: any;

    constructor(user, data, request) {
        this.user = user;
        this.data = data;
        this.request = request;
    }

    async sendNotification(): Promise<void> {
        const body = {
            type: this.data.serviceType,
            request: this.data.data.data.request ? this.request : {}
        };

        await fetch(this.data.data.data.url, {
            headers: {
                "Authorization": this.data.data.data.authorization ? process.env.NOTIFICATION_SECRET : ""
            },
            method: "POST",
            body: JSON.stringify(body)
        });
    }
}
