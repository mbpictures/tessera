import { IOrder } from "../../reducers/orderReducer";
import { Order } from "./Order";
import { FreeSeatOrderParser } from "./FreeSeatOrderParser";
import { SeatOrderParser } from "./SeatOrderParser";

export class OrderFactory {
    static getInstance(data: IOrder, categories): Order {
        if ("orders" in data)
            return new FreeSeatOrderParser(data, categories);
        if ("seats" in data)
            return new SeatOrderParser(data, categories);
    }
}
