export const EVENT_SELECTION_KEY = "event_selection";
export const STEPS = [
    "select-event",
    "choose-seat",
    "personal-information",
    "payment",
    "checkout"
];
export const STEP_URLS = [
    "/",
    "/seatselection/[id]",
    "/information",
    "/payment",
    "/checkout"
];

export const SEAT_COLORS = {
    normal: "#59bb59",
    active: "#5959bb",
    occupied: "#FF2222"
};

export enum Options {
    ShopTitle = "shop.title",
    ShopSubtitle = "shop.subtitle",
    PaymentProviders = "shop.payment-provider",
    Delivery = "shop.delivery",
    Theme = "shop.theme",
    PaymentDetails = "payment.information",
    TaxAmount = "payment.tax-amount"
}
