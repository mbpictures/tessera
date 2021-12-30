import {Shipping} from "./Shipping";

export class DownloadShipping extends Shipping {
    isValid(): boolean {
        return true; // no validation required
    }

    get DisplayName(): string {
        return "Download";
    }
}
