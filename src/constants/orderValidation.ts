import { PaymentFactory, PaymentType } from "../store/factories/payment/PaymentFactory";

export const getTaskType = (task) => {
    if (!hasPayed(task.order))
        return "payment";
    if (!hasShipped(task.order))
        return "shipping";
    return null;
};
export const hasPayed = (order) => {
    return (
        PaymentFactory.getPaymentInstance({
            data: null,
            type: order.paymentType as PaymentType
        })?.paymentResultValid(order.paymentResult) ?? false
    );
};
export const hasShipped = (order) => {
    const shipping = JSON.parse(order.shipping);
    return shipping?.data?.isShipped !== undefined && shipping.data.isShipped;
};
