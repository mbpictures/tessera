import { NextAvailable } from "./NextAvailable";
import {
    IOrder,
    selectOrder
} from "../../reducers/orderReducer";
import { OrderFactory } from "../order/OrderFactory";

export class SeatSelectionNextAvailable extends NextAvailable {
    isNextAvailable(): boolean {
        const data: IOrder = selectOrder(this.state);
        return OrderFactory.getInstance(data, null)?.valid ?? false;
    }
}
