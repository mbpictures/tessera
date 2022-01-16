import { NextAvailable } from "./NextAvailable";
import { selectEventSelected } from "../../reducers/eventSelectionReducer";

export class EventNextAvailable extends NextAvailable {
    isNextAvailable(): boolean {
        const data: number = selectEventSelected(this.state);
        return data >= 0;
    }
}
