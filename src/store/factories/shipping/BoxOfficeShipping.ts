import {Shipping} from "./Shipping";

export class BoxOfficeShipping extends Shipping {
    isValid(): boolean {
        return true; // no validation required
    }
}
