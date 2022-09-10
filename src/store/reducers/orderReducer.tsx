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
    firstName?: string;
    lastName?: string;
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
        setTicketFirstName: (state, action: PayloadAction<{index: number; firstName: string;}>) => {
            state.tickets[action.payload.index].firstName = action.payload.firstName;
        },
        setTicketLastName: (state, action: PayloadAction<{index: number; lastName: string;}>) => {
            state.tickets[action.payload.index].lastName = action.payload.lastName;
        },
        resetOrder: () => initialState
    }
});

export const { setTickets, setOrderId, resetOrder, setTicketFirstName, setTicketLastName } = orderSlice.actions;
export const selectOrder = (state: RootState) => state.order;
export default orderSlice.reducer;
