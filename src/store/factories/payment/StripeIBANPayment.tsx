import {Payment} from "./Payment";
import React from "react";
import {PaymentType} from "./PaymentFactory";
import {StripeIBAN, StripeIBANHeader} from "../../../components/payment/StripeIBAN";

export interface StripeIBANPaymentData {
    ibanComplete: boolean;
}

export class StripeIBANPayment extends Payment {

    getComponent(): React.ReactNode {
        return <StripeIBAN />;
    }

    isValid(): boolean {
        const data = JSON.parse(this.data.data) as StripeIBANPaymentData;
        if (data === null) return false;
        return data.ibanComplete;
    }

    setData(data: StripeIBANPaymentData) {
        this.data = {type: PaymentType.CreditCard, data: JSON.stringify(data)};
    }

    getHeaderComponent(): React.ReactNode {
        return <StripeIBANHeader />;
    }
}
