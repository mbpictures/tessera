import { Payment } from "./Payment";
import React from "react";
import { PaymentType } from "./PaymentFactory";
import {
    StripeIBAN,
    StripeIBANHeader
} from "../../../components/payment/StripeIBAN";
import { PayButton } from "../../../components/payment/button/PayButton";

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
        this.data = {
            type: PaymentType.StripeIBAN,
            data: JSON.stringify(data)
        };
    }

    getHeaderComponent(): React.ReactNode {
        return <StripeIBANHeader />;
    }

    paymentResultValid(data: any): boolean {
        const json = JSON.parse(data);
        return json?.event === "charge.succeeded";
    }

    getPaymentButton(): React.ReactNode {
        return <PayButton />;
    }

    getValidPaymentResult(data?: any): Object {
        return { event: "charge.succeeded" };
    }

    override paymentIntentValid(data: any): boolean {
        return super.paymentIntentValid(data) ? !!JSON.parse(data)?.client_secret : false;
    }
}
