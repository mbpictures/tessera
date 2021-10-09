import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";

interface OrderState {
    order: IOrder;
};

interface IOrder {
    ticketAmount: number
}

const initialState: OrderState = {
    order: {
        ticketAmount: -1
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
