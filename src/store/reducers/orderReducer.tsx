import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface OrderState {
    tickets: Tickets;
    orderId?: string;
}

export interface Ticket {
    seatId?: number;
    categoryId: number;
    amount: number;
}

export type Tickets = Array<Ticket>;

const initialState: OrderState = {
    tickets: []
};

export const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setTickets: (state, action: PayloadAction<Tickets>) => {
            state.tickets = action.payload;
        },
        setOrderId: (state, action: PayloadAction<string>) => {
            state.orderId = action.payload;
        },
        resetOrder: () => initialState
    }
});

export const { setTickets, setOrderId, resetOrder } = orderSlice.actions;
export const selectOrder = (state: RootState) => state.order;
export default orderSlice.reducer;
