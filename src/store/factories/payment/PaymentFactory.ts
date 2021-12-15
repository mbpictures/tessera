import {IPayment} from "../../reducers/paymentReducer";
import {Payment} from "./Payment";
import {CreditCardPayment} from "./CreditCardPayment";
import {StripeIBANPayment} from "./StripeIBANPayment";
import {SofortPayment} from "./Sofort";
import {InvoicePayment} from "./InvoicePayment";
import {PayPalPayment} from "./PayPalPayment";

export enum PaymentType {
    CreditCard = "creditcard",
    StripeIBAN = "stripeiban",
    Sofort = "sofort",
    Invoice = "invoice",
    PayPal = "paypal"
}

export class PaymentFactory {
    static getPaymentInstance(data: IPayment): Payment {
        if (data == null) return null;
        if (data.type === PaymentType.CreditCard)
            return new CreditCardPayment(data);
        if (data.type === PaymentType.StripeIBAN)
            return new StripeIBANPayment(data);
        if (data.type === PaymentType.Sofort)
            return new SofortPayment(data);
        if (data.type === PaymentType.Invoice)
            return new InvoicePayment(data);
        if (data.type === PaymentType.PayPal)
            return new PayPalPayment(data);
        return null;
    }

    static getAllPaymentInstances(): Array<Payment> {
        return Object.values(PaymentType).map(value => PaymentFactory.getPaymentInstance({data: null, type: value}));
    }
}
