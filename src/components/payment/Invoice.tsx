import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    selectPayment,
    setPaymentStatus
} from "../../store/reducers/paymentReducer";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import { OrderState, selectOrder } from "../../store/reducers/orderReducer";
import useTranslation from "next-translate/useTranslation";
import { idempotencyCall } from "../../lib/idempotency/clientsideIdempotency";
import payment from "../../../locale/en/payment.json";

export const Invoice = () => {
    const selector = useAppSelector(selectPayment);
    const order: OrderState = useAppSelector(selectOrder);
    const dispatch = useAppDispatch();

    const { t } = useTranslation();

    useEffect(() => {
        if (
            selector.state !== "initiate" ||
            selector.payment.type !== PaymentType.Invoice
        )
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));
            await idempotencyCall("api/payment_intent/invoice", { order: order });
            dispatch(setPaymentStatus("finished"));
        }

        processPayment().catch(() => dispatch(setPaymentStatus("failure")));
    }, [selector, dispatch, order]);

    return (
        <Typography>
            {t("payment:invoice-description", null, {fallback: payment["invoice-description"]})}
        </Typography>
    );
};

export const InvoiceHeader = () => {
    const { t } = useTranslation();
    return <Typography>{t("payment:invoice", null, {fallback: payment["invoice"]})}</Typography>;
};
