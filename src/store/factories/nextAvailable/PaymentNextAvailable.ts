import { NextAvailable } from "./NextAvailable";
import { selectPayment } from "../../reducers/paymentReducer";
import { PaymentFactory } from "../payment/PaymentFactory";

export class PaymentNextAvailable extends NextAvailable {
    isNextAvailable(): boolean {
        const data = selectPayment(this.state);
        return (
            PaymentFactory.getPaymentInstance(data.payment)?.isValid() ?? false
        ) && data.gtcAccepted;
    }
}
