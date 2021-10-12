import {IShipping} from "../../reducers/personalInformationReducer";
import {Shipping} from "./Shipping";
import {PostalDeliveryShipping} from "./PostalDeliveryShipping";
import {DownloadShipping} from "./DownloadShipping";
import {BoxOfficeShipping} from "./BoxOfficeShipping";

export enum ShippingType {
    Post = "post",
    Download = "download",
    BoxOffice = "boxoffice"
}

export class ShippingFactory {
    static getShippingInstance(data: IShipping): Shipping {
        if (data == null) return null;
        if (data.type === ShippingType.Post)
            return new PostalDeliveryShipping(data);
        if (data.type === ShippingType.Download)
            return new DownloadShipping(data);
        if (data.type ===ShippingType.BoxOffice)
            return new BoxOfficeShipping(data);
        return null;
    }
}
