import {Payment} from "./Payment";

export class PayPalPayment extends Payment {
    getComponent(): React.ReactNode {
        return undefined;
    }

    getHeaderComponent(): React.ReactNode {
        return undefined;
    }

    isValid(): boolean {
        return true;
    }

    paymentResultValid(data: any): boolean {
        return (JSON.parse(data)?.status ?? "error") === "COMPLETED";
    }

}