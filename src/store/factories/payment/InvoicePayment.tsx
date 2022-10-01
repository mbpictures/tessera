import { Payment } from "./Payment";
import React from "react";
import { Invoice, InvoiceHeader } from "../../../components/payment/Invoice";
import { PayButton } from "../../../components/payment/button/PayButton";

export class InvoicePayment extends Payment {
    getComponent(): React.ReactNode {
        return <Invoice />;
    }

    isValid(): boolean {
        return true;
    }

    getHeaderComponent(hasFee: boolean, fees?: string): React.ReactNode {
        return <InvoiceHeader hasFee={hasFee} fees={fees} />;
    }

    paymentResultValid(data: any): boolean {
        const json = JSON.parse(data);
        return json?.payed ?? false;
    }

    getPaymentButton(): React.ReactNode {
        return <PayButton />;
    }

    getValidPaymentResult(data?: any): Object {
        return { payed: true };
    }
}
