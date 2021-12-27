import {RootState} from "../../store";
import {STEP_URLS} from "../../../constants/Constants";
import {EventNextAvailable} from "./EventNextAvailable";
import {SeatSelectionNextAvailable} from "./SeatSelectionNextAvailable";
import {InformationNextAvailable} from "./InformationNextAvailable";
import {NextAvailable} from "./NextAvailable";
import {PaymentNextAvailable} from "./PaymentNextAvailable";

export class NextAvailableFactory {
    static getInstance(url, state: RootState): NextAvailable {
        if (url === STEP_URLS[0])
            return new EventNextAvailable(state);
        if (url === STEP_URLS[1])
            return new SeatSelectionNextAvailable(state);
        if (url === STEP_URLS[2])
            return new InformationNextAvailable(state);
        if (url === STEP_URLS[3])
            return new PaymentNextAvailable(state);
        return null;
    }
}
