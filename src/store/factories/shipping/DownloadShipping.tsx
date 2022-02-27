import { Shipping } from "./Shipping";
import { DownloadShippingComponent } from "../../../components/shipping/DownloadShippingComponent";
import React from "react";

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
}
