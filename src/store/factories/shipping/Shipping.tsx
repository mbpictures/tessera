import { IShipping } from "../../reducers/personalInformationReducer";
import React from "react";

export abstract class Shipping {
    shippingData: IShipping;

    constructor(shipping: IShipping) {
        this.shippingData = shipping;
    }

    get Shipping(): IShipping {
        return this.shippingData;
    }

    abstract get DisplayName(): string;

    abstract get Component(): React.ReactElement;

    abstract isValid(): boolean;
}
