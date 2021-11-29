import {IPayment} from "../../reducers/paymentReducer";
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

    get component(): React.ReactNode {
        if (!Payment._component)
            Payment._component = this.getComponent();
        return Payment._component;
    }

    abstract isValid(): boolean;
}
