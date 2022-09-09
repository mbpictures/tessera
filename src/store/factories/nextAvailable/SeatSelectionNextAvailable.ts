import { NextAvailable } from "./NextAvailable";
import {
    OrderState,
    selectOrder
} from "../../reducers/orderReducer";

export class SeatSelectionNextAvailable extends NextAvailable {
    isNextAvailable(): boolean {
        const data: OrderState = selectOrder(this.state);
        return data.tickets.length > 0;
    }
}
