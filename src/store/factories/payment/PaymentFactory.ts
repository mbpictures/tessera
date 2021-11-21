import {IPayment} from "../../reducers/paymentReducer";
import {Payment} from "./Payment";
import {CreditCardPayment} from "./CreditCardPayment";

export enum PaymentType {
    CreditCard = "creditcard"
}

export class PaymentFactory {
    static getPaymentInstance(data: IPayment): Payment {
        if (data == null) return null;
        if (data.type === PaymentType.CreditCard)
            return new CreditCardPayment(data);
        return null;
    }
}
