import { NextAvailable } from "./NextAvailable";
import {
    PersonalInformationState,
    selectPersonalInformation
} from "../../reducers/personalInformationReducer";
import { validateAddress, validateTicketNames } from "../../../constants/util";
import { ShippingFactory } from "../shipping/ShippingFactory";
import { selectOrder } from "../../reducers/orderReducer";

const validateEmail = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export class InformationNextAvailable extends NextAvailable {
    static customFieldsValid(fields: Array<{name: string, label: string, isRequired: boolean}>, userFields): boolean {
        return fields.filter(field => field.isRequired).every(field => userFields[field.name] && userFields[field.name].length > 0);
    }

    isNextAvailable(): boolean {
        const data: PersonalInformationState = selectPersonalInformation(
            this.state
        );
        const order = selectOrder(this.state);
        const ticketsValid = order.ticketPersonalizationRequired ? validateTicketNames(order.tickets) : true;
        const customFieldsValid = InformationNextAvailable.customFieldsValid(data.serverCustomFields, data.customFields);
        const emailValid = validateEmail(data.email);
        return (
            ticketsValid &&
            emailValid &&
            customFieldsValid &&
            validateAddress(data.address) &&
            (ShippingFactory.getShippingInstance(data.shipping)?.isValid() ??
                false)
        );
    }
}
