import {Payment} from "./Payment";
import {FunctionComponent} from "react";
import {StripeCard} from "../../../components/payment/StripeCard";
import {PaymentType} from "./PaymentFactory";

export interface CreditCardPaymentData {
    cardNumberComplete: boolean;
    expiredComplete: boolean;
    cvcComplete: boolean;
}

export class CreditCardPayment extends Payment {

    getComponent(): FunctionComponent {
        return StripeCard;
    }

    isValid(): boolean {
        const data = JSON.parse(this.data.data) as CreditCardPaymentData;
        return data.cardNumberComplete && data.cvcComplete && data.expiredComplete;
    }

    setData(data: CreditCardPaymentData) {
        this.data = {type: PaymentType.CreditCard, data: JSON.stringify(data)};
    }
}
