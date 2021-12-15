import {Payment} from "./Payment";
import React from "react";
import {PayPal, PayPalHeader} from "../../../components/payment/PayPal";

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
}
