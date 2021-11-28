import {Typography} from "@mui/material";
import React, {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {selectPayment, setPaymentStatus} from "../../store/reducers/paymentReducer";
import {PaymentType} from "../../store/factories/payment/PaymentFactory";
import axios from "axios";
import {selectOrder} from "../../store/reducers/orderReducer";

export const Sofort = () => {
    const selector = useAppSelector(selectPayment);
    const selectorOrder = useAppSelector(selectOrder);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (selector.state !== "initiate" || selector.payment.type !== PaymentType.Sofort)
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));

            const response = await axios.post("api/payment_intent/sofort", {order: selectorOrder});
            window.location.assign(response.data.redirectUrl)
        }

        processPayment().catch(() => dispatch(setPaymentStatus("failure")));

    }, [selector]);


    return (
        <Typography>After clicking on "pay now" you will be redirected to "sofort" payment.</Typography>
    )
};
