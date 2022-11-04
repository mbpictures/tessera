import { Payment } from "./Payment";
import React from "react";
import {
    StripeCard,
    StripeCardHeader
} from "../../../components/payment/StripeCard";
import { PaymentType } from "./PaymentFactory";
import { PayButton } from "../../../components/payment/button/PayButton";

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
        return (
            data.cardNumberComplete && data.cvcComplete && data.expiredComplete
        );
    }

    setData(data: CreditCardPaymentData) {
        this.data = {
            type: PaymentType.CreditCard,
            data: JSON.stringify(data)
        };
    }

    getHeaderComponent(): React.ReactNode {
        return <StripeCardHeader />;
    }

    paymentResultValid(data: any): boolean {
        return JSON.parse(data)?.event === "charge.succeeded";
    }

    getPaymentButton(): React.ReactNode {
        return <PayButton />;
    }

    getValidPaymentResult(data?: any): Object {
        return {event: "charge.succeeded"};
    }

    override paymentIntentValid(data: any): boolean {
        return super.paymentIntentValid(data) ? !!JSON.parse(data)?.client_secret : false;
    }
}
