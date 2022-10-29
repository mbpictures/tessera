import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { PaymentType } from "../factories/payment/PaymentFactory";

type PaymentStatus =
    | "none"
    | "persist"
    | "initiate"
    | "processing"
    | "finished"
    | "failure";

interface PaymentState {
    payment: IPayment;
    state: PaymentStatus;
    idempotencyKey: string | null;
    gtcAccepted: boolean;
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
    state: "none",
    idempotencyKey: null,
    gtcAccepted: false
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
        },
        setIdempotencyKey: (state, action: PayloadAction<string>) => {
            state.idempotencyKey = action.payload;
        },
        setGtcAccepted: (state, action: PayloadAction<boolean>) => {
            state.gtcAccepted = action.payload;
        },
        resetPayment: () => initialState
    }
});

export const { setPayment, setPaymentStatus, resetPayment, setIdempotencyKey, setGtcAccepted } = paymentSlice.actions;
export const selectPayment = (state: RootState) => state.payment;
export default paymentSlice.reducer;
