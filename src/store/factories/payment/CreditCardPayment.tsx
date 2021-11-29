import {Payment} from "./Payment";
import React from "react";
import {StripeCard, StripeCardHeader} from "../../../components/payment/StripeCard";
import {PaymentType} from "./PaymentFactory";

export interface CreditCardPaymentData {
    cardNumberComplete: boolean;
    expiredComplete: boolean;
    cvcComplete: boolean;
}

export class CreditCardPayment extends Payment {

    getComponent(): React.ReactNode {
        return <StripeCard />;
    }

    isValid(): boolean {
        const data = JSON.parse(this.data.data) as CreditCardPaymentData;
        if (data === null) return false;
        return data.cardNumberComplete && data.cvcComplete && data.expiredComplete;
    }

    setData(data: CreditCardPaymentData) {
        this.data = {type: PaymentType.CreditCard, data: JSON.stringify(data)};
    }

    getHeaderComponent(): React.ReactNode {
        return <StripeCardHeader />;
    }
}
