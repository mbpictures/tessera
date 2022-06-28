import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Seat } from "../../components/seatselection/seatmap/SeatMapSeat";

interface OrderState {
    order: IOrder;
}

export interface IOrder {
    ticketAmount: number;
    totalPrice: number;
    orderId?: string;
}

export interface FreeSeatOrder extends IOrder {
    orders: Array<{ amount: number; categoryId: number; price: number }>;
}

export interface SeatOrder extends IOrder {
    seats: Array<Seat>;
}

const initialState: OrderState = {
    order: {
        ticketAmount: -1,
        totalPrice: 0,
        orderId: null
    }
};

export const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrder: (state, action: PayloadAction<IOrder>) => {
            state.order = action.payload;
        },
        setOrderId: (state, action: PayloadAction<string>) => {
            state.order.orderId = action.payload;
        }
    }
});

export const { setOrder, setOrderId } = orderSlice.actions;
export const selectOrder = (state: RootState) => state.order.order;
export default orderSlice.reducer;
