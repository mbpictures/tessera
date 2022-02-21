export const EVENT_SELECTION_KEY = "event_selection";
export const STEPS = [
    "Select Event",
    "Choose seat",
    "Personal Information",
    "Payment",
    "Checkout Order"
];
export const STEP_URLS = [
    "/",
    "/seatselection",
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
    Delivery = "shop.delivery"
}
