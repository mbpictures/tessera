import { Shipping } from "./Shipping";
import { DownloadShippingComponent } from "../../../components/shipping/DownloadShippingComponent";
import React from "react";
import { ShippingType } from "./ShippingFactory";
import { IShipping } from "../../reducers/personalInformationReducer";

export class DownloadShipping extends Shipping {
    isValid(): boolean {
        return true; // no validation required
    }

    get DisplayName(): string {
        return "download";
    }

    get Component(): React.ReactElement {
        return <DownloadShippingComponent />;
    }

    getSuccessfulShipping(): IShipping {
        return {
            type: ShippingType.Download,
            data: {
                isShipped: true
            }
        };
    }
}
