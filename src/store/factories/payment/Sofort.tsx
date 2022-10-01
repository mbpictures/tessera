import { Payment } from "./Payment";
import { Sofort, SofortHeader } from "../../../components/payment/Sofort";
import React from "react";
import { PayButton } from "../../../components/payment/button/PayButton";

export class SofortPayment extends Payment {
    getComponent(): React.ReactNode {
        return <Sofort />;
    }

    isValid(): boolean {
        return true;
    }

    getHeaderComponent(hasFee: boolean, fees?: string): React.ReactNode {
        return <SofortHeader hasFee={hasFee} fees={fees} />;
    }

    paymentResultValid(data: any): boolean {
        return JSON.parse(data)?.transaction?.status ?? false;
    }

    getPaymentButton(): React.ReactNode {
        return <PayButton />;
    }

    getValidPaymentResult(data?: any): Object {
        return { status: true };
    }
}
