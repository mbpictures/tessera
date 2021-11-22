import {IPayment} from "../../reducers/paymentReducer";
import {Payment} from "./Payment";
import {CreditCardPayment} from "./CreditCardPayment";
import {StripeIBANPayment} from "./StripeIBANPayment";

export enum PaymentType {
    CreditCard = "creditcard",
    StripeIBAN = "stripeiban"
}

export class PaymentFactory {
    static getPaymentInstance(data: IPayment): Payment {
        if (data == null) return null;
        if (data.type === PaymentType.CreditCard)
            return new CreditCardPayment(data);
        if (data.type === PaymentType.StripeIBAN)
            return new StripeIBANPayment(data);
        return null;
    }
}
