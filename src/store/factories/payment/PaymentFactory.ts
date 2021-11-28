import {IPayment} from "../../reducers/paymentReducer";
import {Payment} from "./Payment";
import {CreditCardPayment} from "./CreditCardPayment";
import {StripeIBANPayment} from "./StripeIBANPayment";
import {SofortPayment} from "./Sofort";

export enum PaymentType {
    CreditCard = "creditcard",
    StripeIBAN = "stripeiban",
    Sofort = "sofort"
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
        return null;
    }
}
