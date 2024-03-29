import { IPayment } from "../../reducers/paymentReducer";
import React from "react";

export abstract class Payment {
    data: IPayment;
    static _component: React.ReactNode;

    constructor(data: IPayment) {
        this.data = data;
    }

    getData() {
        return this.data;
    }

    abstract getComponent(): React.ReactNode;
    abstract getHeaderComponent(): React.ReactNode;
    abstract getPaymentButton(): React.ReactNode;
    abstract paymentResultValid(data: any): boolean;
    abstract getValidPaymentResult(data?: any): Object;

    get component(): React.ReactNode {
        if (!Payment._component) Payment._component = this.getComponent();
        return Payment._component;
    }

    abstract isValid(): boolean;

    needsManualProcessing(): boolean {
        return false;
    }

    paymentIntentValid(data: any): boolean {
        return data !== "" && data !== null;
    }
}
