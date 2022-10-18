import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface OrderState {
    tickets: Tickets;
    orderId?: string;
    ticketPersonalizationRequired: boolean;
    reservationId?: string;
    reservationExpiresAt?: number;
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
    tickets: [],
    ticketPersonalizationRequired: false
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
        setTicketPersonalizationRequired: (state, action: PayloadAction<boolean>) => {
            state.ticketPersonalizationRequired = action.payload;
        },
        setReservationId: (state, action: PayloadAction<string>) => {
            state.reservationId = action.payload;
        },
        setReservationExpiresAt: (state, action: PayloadAction<number>) => {
            state.reservationExpiresAt = action.payload;
        },
        resetOrder: () => initialState
    }
});

export const { setTickets, setOrderId, resetOrder, setTicketFirstName, setTicketLastName, setTicketPersonalizationRequired, setReservationId, setReservationExpiresAt } = orderSlice.actions;
export const selectOrder = (state: RootState) => state.order;
export default orderSlice.reducer;
