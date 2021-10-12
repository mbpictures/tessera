import {IShipping} from "../../reducers/personalInformationReducer";

export abstract class Shipping {
    shippingData: IShipping;

    constructor(shipping: IShipping) {
        this.shippingData = shipping;
    }

    get Shipping(): IShipping {
        return this.shippingData;
    }

    abstract isValid(): boolean;
}