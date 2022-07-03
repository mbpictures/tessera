import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    selectPayment,
    setPaymentStatus
} from "../../store/reducers/paymentReducer";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import axios from "axios";
import { selectOrder } from "../../store/reducers/orderReducer";
import Image from "next/image";
import logo from "../../assets/payment/klarna.svg";
import { useTranslation } from "next-i18next";

export const Sofort = () => {
    const selector = useAppSelector(selectPayment);
    const selectorOrder = useAppSelector(selectOrder);
    const dispatch = useAppDispatch();

    const { t } = useTranslation();

    useEffect(() => {
        if (
            selector.state !== "initiate" ||
            selector.payment.type !== PaymentType.Sofort
        )
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));

            const response = await axios.post("api/payment_intent/sofort", {
                order: selectorOrder
            });
            window.location.assign(response.data.redirectUrl);
        }

        processPayment().catch(() => dispatch(setPaymentStatus("failure")));
    }, [selector, selectorOrder, dispatch]);

    return (
        <Typography>
            {t("payment:klarna-description")}
        </Typography>
    );
};

export const SofortHeader = () => {
    return <Image src={logo} height={50} alt="Klarna Logo" />;
};
