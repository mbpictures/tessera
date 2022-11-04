import { Payment } from "./Payment";
import React from "react";
import { PayPal, PayPalHeader } from "../../../components/payment/PayPal";

export class PayPalPayment extends Payment {
    getComponent(): React.ReactNode {
        return undefined;
    }

    getHeaderComponent(): React.ReactNode {
        return <PayPalHeader />;
    }

    isValid(): boolean {
        return true;
    }

    paymentResultValid(data: any): boolean {
        return (JSON.parse(data)?.status ?? "error") === "COMPLETED";
    }

    getPaymentButton(): React.ReactNode {
        return <PayPal />;
    }

    getValidPaymentResult(data?: any): Object {
        return { status: "COMPLETED" };
    }

    override paymentIntentValid(data: any): boolean {
        const validIntentStatus = ["CREATED", "SAVED", "APPROVED", "PAYER_ACTION_REQUIRED"];
        return super.paymentIntentValid(data) ? validIntentStatus.includes(JSON.parse(data)?.status) : false;
    }
}
