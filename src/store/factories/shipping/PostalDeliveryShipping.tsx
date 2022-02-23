import { IAddress } from "../../../constants/interfaces";
import { validateAddress } from "../../../constants/util";
import { Shipping } from "./Shipping";
import { ShippingType } from "./ShippingFactory";
import { PostalDeliveryShippingComponent } from "../../../components/shipping/PostalDeliveryShippingComponent";
import React from "react";

export interface PostalDeliveryData {
    differentAddress: boolean;
    address?: IAddress;
}

const DEFAULT: PostalDeliveryData = {
    differentAddress: false,
    address: {
        firstName: "",
        lastName: "",
        address: "",
        zip: "",
        city: "",
        country: null,
        region: null
    }
};

export class PostalDeliveryShipping extends Shipping {
    set data(data: PostalDeliveryData) {
        this.shippingData = {
            type: ShippingType.Post,
            data: JSON.stringify(data)
        };
    }

    isValid(): boolean {
        const data: PostalDeliveryData = this.postalData;
        if (!data) return false;
        return data.differentAddress ? validateAddress(data.address) : true;
    }

    get postalData(): PostalDeliveryData {
        if (this.shippingData == null) return DEFAULT;
        try {
            return JSON.parse(this.shippingData.data);
        } catch (e) {
            return DEFAULT;
        }
    }

    get DisplayName(): string {
        return "Postal Delivery";
    }

    get Component(): React.ReactElement {
        return <PostalDeliveryShippingComponent />;
    }
}
