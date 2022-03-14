import { NextAvailable } from "./NextAvailable";
import {
    PersonalInformationState,
    selectPersonalInformation
} from "../../reducers/personalInformationReducer";
import { validateAddress } from "../../../constants/util";
import { ShippingFactory } from "../shipping/ShippingFactory";

const validateEmail = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export class InformationNextAvailable extends NextAvailable {
    isNextAvailable(): boolean {
        const data: PersonalInformationState = selectPersonalInformation(
            this.state
        );
        const emailValid = validateEmail(data.email);
        return (
            emailValid &&
            validateAddress(data.address) &&
            (ShippingFactory.getShippingInstance(data.shipping)?.isValid() ??
                false)
        );
    }
}
