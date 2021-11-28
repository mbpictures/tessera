import {Payment} from "./Payment";
import {Sofort} from "../../../components/payment/Sofort";
import React from "react";

export class SofortPayment extends Payment{
    getComponent(): React.FunctionComponent {
        return Sofort;
    }

    isValid(): boolean {
        return true;
    }

}
