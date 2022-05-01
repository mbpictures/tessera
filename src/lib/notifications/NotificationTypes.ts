export const NotificationsOrder = ["store"];
export const NotificationsPayment = ["invoice", "paypal", "sofort", "stripe"];

export type NotificationOrderType = typeof NotificationsOrder[number];
export type NotificationsPaymentType = typeof NotificationsPayment[number];

export const Notifications = {
    "order": NotificationsOrder,
    "payment_intent": NotificationsPayment,
    "webhook": NotificationsPayment
}

export type NotificationService = keyof typeof Notifications;
export type NotificationServiceType = NotificationsPaymentType | NotificationOrderType;

export type NotificationType = [NotificationService, NotificationServiceType];

export interface NotificationData {
    services: Array<NotificationType>;
    additionalData: any;
}

export enum NotificationHandler {
    "Email" = "email"
}

export const notificationRoutes = Object.entries(Notifications)
    .map(type => Object.values(type[1])
        .map(handler => `api/${type[0]}/${handler}`)).flat(2);
