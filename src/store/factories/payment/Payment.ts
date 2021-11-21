import {FunctionComponent} from "react";
import {IPayment} from "../../reducers/paymentReducer";

export abstract class Payment {
    data: IPayment;
    static _component: FunctionComponent;

    constructor(data: IPayment) {
        this.data = data;
    }

    getData() {
        return this.data;
    }

    abstract getComponent(): FunctionComponent;

    get component(): FunctionComponent {
        if (!Payment._component)
            Payment._component = this.getComponent();
        return Payment._component;
    }

    abstract isValid(): boolean;
}
