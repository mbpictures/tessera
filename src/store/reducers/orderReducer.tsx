import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

interface OrderState {
    order: IOrder;
};

export interface IOrder {
    ticketAmount: number;
    totalPrice: number;
}

export interface FreeSeatOrder extends IOrder {
    orders: Array<{amount: number, categoryId: number, price: number}>;
}

const initialState: OrderState = {
    order: {
        ticketAmount: -1,
        totalPrice: 0
    }
};

export const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrder: (state, action: PayloadAction<IOrder>) => {
            state.order = action.payload;
        }
    }
});

export const {setOrder} = orderSlice.actions;
export const selectOrder = (state: RootState) => state.order.order;
export default orderSlice.reducer;
