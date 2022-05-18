export interface NotificationHandler {
    sendNotification: () => Promise<void>;
}
