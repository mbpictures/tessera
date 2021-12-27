import {NextAvailable} from "./NextAvailable";
import {FreeSeatOrder, IOrder, selectOrder} from "../../reducers/orderReducer";

export class SeatSelectionNextAvailable extends NextAvailable {
    isNextAvailable(): boolean {
        const data: IOrder = selectOrder(this.state);
        if ("orders" in data)
            return (data as FreeSeatOrder).orders.every(value => value.amount > 0 && value.categoryId >= 0);
        return data.ticketAmount > 0;
    }
}
