import {Payment} from "./Payment";
import {FunctionComponent} from "react";
import {StripeCard} from "../../../components/payment/StripeCard";
import {PaymentType} from "./PaymentFactory";

export interface StripeIBANPaymentData {
    ibanComplete: boolean;
}

export class StripeIBANPayment extends Payment {

    getComponent(): FunctionComponent {
        return StripeCard;
    }

    isValid(): boolean {
        const data = JSON.parse(this.data.data) as StripeIBANPaymentData;
        if (data === null) return false;
        return data.ibanComplete;
    }

    setData(data: StripeIBANPaymentData) {
        this.data = {type: PaymentType.CreditCard, data: JSON.stringify(data)};
    }
}
