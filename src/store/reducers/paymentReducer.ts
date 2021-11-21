import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../store";
import {PaymentType} from "../factories/payment/PaymentFactory";

type PaymentStatus = "none" | "initiate" | "processing" | "finished" | "failure";

interface PaymentState {
    payment: IPayment;
    state: PaymentStatus;
}

export interface IPayment {
    data: any;
    type: PaymentType;
}

const initialState: PaymentState = {
    payment: {
        data: "",
        type: null
    },
    state: "none"
};

export const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        setPayment: (state, action: PayloadAction<IPayment>) => {
            state.payment = action.payload;
        },
        setPaymentStatus: (state, action: PayloadAction<PaymentStatus>) => {
            state.state = action.payload;
        }
    }
});

export const {setPayment, setPaymentStatus} = paymentSlice.actions;
export const selectPayment = (state: RootState) => state.payment;
export default paymentSlice.reducer;
