import paypal from "@paypal/checkout-server-sdk";

export const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

export const environment = () => {
    if (
        process.env.PAYPAL_CLIENT_LIVE_ENVIRONMENT &&
        process.env.PAYPAL_CLIENT_LIVE_ENVIRONMENT.toLowerCase() === "true"
    )
        new paypal.core.LiveEnvironment(clientId, clientSecret);
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

let _paypalClient = null;

export const paypalClient = () => {
    if (!_paypalClient)
        _paypalClient = new paypal.core.PayPalHttpClient(environment());
    return _paypalClient;
};
