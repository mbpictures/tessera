import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

interface OrderState {
    order: IOrder;
}

export interface IOrder {
    ticketAmount: number;
    totalPrice: number;
    orderId?: number;
}

export interface FreeSeatOrder extends IOrder {
    orders: Array<{amount: number, categoryId: number, price: number}>;
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
        setOrderId: (state, action: PayloadAction<number>) => {
            state.order.orderId = action.payload;
        }
    }
});

export const {setOrder, setOrderId} = orderSlice.actions;
export const selectOrder = (state: RootState) => state.order.order;
export default orderSlice.reducer;
