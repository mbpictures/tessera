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
    TaxAmount = "payment.tax-amount",
    PaymentFeesShipping = "payment.fees.shipping",
    PaymentFeesPayment = "payment.fees.payment",
    TemplateInvoice = "template.invoice",
    TemplateConfirmEmail = "template.confirm-email",
    TemplateTicket = "template.ticket",
    InvoiceNumber = "payment.invoice-number"
}

export const OptionLabels: Partial<Record<Options, string>> = {
    "template.invoice": "Template Invoice",
    "template.confirm-email": "Template Confirmation Email",
    "template.ticket": "Template Ticket"
}
