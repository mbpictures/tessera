import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    selectPayment,
    setPaymentStatus
} from "../../store/reducers/paymentReducer";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import axios from "axios";
import { IOrder, selectOrder } from "../../store/reducers/orderReducer";

export const Invoice = () => {
    const selector = useAppSelector(selectPayment);
    const order: IOrder = useAppSelector(selectOrder);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (
            selector.state !== "initiate" ||
            selector.payment.type !== PaymentType.Invoice
        )
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));
            await axios.post("api/payment_intent/invoice", { order: order });
            dispatch(setPaymentStatus("finished"));
        }

        processPayment().catch(() => dispatch(setPaymentStatus("failure")));
    }, [selector, dispatch, order]);

    return (
        <Typography>
            You will receive an invoice containing the recipient&apos;s bank details
            by e-mail.
        </Typography>
    );
};

export const InvoiceHeader = () => {
    return <Typography>Invoice</Typography>;
};
