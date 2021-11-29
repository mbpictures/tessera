import {Payment} from "./Payment";
import {Sofort, SofortHeader} from "../../../components/payment/Sofort";
import React from "react";

export class SofortPayment extends Payment{
    getComponent(): React.ReactNode {
        return <Sofort />;
    }

    isValid(): boolean {
        return true;
    }

    getHeaderComponent(): React.ReactNode {
        return <SofortHeader />;
    }

}
