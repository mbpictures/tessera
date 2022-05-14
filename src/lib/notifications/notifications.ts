import prisma from "../prisma";
import { NotificationFactory } from "./NotificationFactory";
import { NotificationData, NotificationHandler, NotificationType } from "./NotificationTypes";

export const sendNotifications = async (request: any) => {
    const [serviceType, service] = request.type as NotificationType;
    const notifications = await prisma.notification.findMany({
        select: {
            data: true,
            type: true,
            user: true
        }
    });
    const promises = notifications
        .filter(notification => {
            const data = JSON.parse(notification.data) as NotificationData;
            return data.services.some(serviceData => serviceData[0] === serviceType && serviceData[1] === service);
        })
        .map(notification =>
            NotificationFactory.getInstance(
                notification.type as NotificationHandler,
                notification.user,
                {
                    data: JSON.parse(notification.data),
                    serviceType: [serviceType, service]
                },
                request
            ).sendNotification()
        );
    await Promise.all(promises);
};
