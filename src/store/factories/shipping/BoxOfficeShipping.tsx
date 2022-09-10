import { Shipping } from "./Shipping";
import { BoxOfficeShippingComponent } from "../../../components/shipping/BoxOfficeShippingComponent";
import React from "react";
import { IShipping } from "../../reducers/personalInformationReducer";
import { ShippingType } from "./ShippingFactory";

export class BoxOfficeShipping extends Shipping {
    isValid(): boolean {
        return true; // no validation required
    }

    get DisplayName(): string {
        return "box-office";
    }

    get Component(): React.ReactElement {
        return <BoxOfficeShippingComponent />;
    }

    getSuccessfulShipping(): IShipping {
        return {
            type: ShippingType.BoxOffice,
            data: {
                isShipped: true
            }
        };
    }
}
