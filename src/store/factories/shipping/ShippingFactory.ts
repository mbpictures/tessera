import {IShipping} from "../../reducers/personalInformationReducer";
import {Shipping} from "./Shipping";
import {PostalDeliveryShipping} from "./PostalDeliveryShipping";

export class ShippingFactory {
    static getShippingInstance(data: IShipping): Shipping {
        if (data.type === "post")
            return new PostalDeliveryShipping(data);
        return null;
    }
}