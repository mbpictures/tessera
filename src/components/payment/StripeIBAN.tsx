import React, { useEffect } from "react";
import { StripeTextFieldIBAN } from "./stripe/StripeElementWrapper";
import { IbanElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    selectPayment,
    setPayment,
    setPaymentStatus
} from "../../store/reducers/paymentReducer";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import axios from "axios";
import { selectOrder } from "../../store/reducers/orderReducer";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import { selectPersonalInformation } from "../../store/reducers/personalInformationReducer";
import { StripeIBANPayment } from "../../store/factories/payment/StripeIBANPayment";
import { Typography } from "@mui/material";
import useTranslation from "next-translate/useTranslation";

export const StripeIBAN = () => {
    const selector = useAppSelector(selectPayment);
    const selectorOrder = useAppSelector(selectOrder);
    const selectorEvent = useAppSelector(selectEventSelected);
    const selectorInformation = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const stripe = useStripe();

    const [state, setState] = React.useState({
        ibanComplete: false,
        ibanError: null
    });

    const elements = useElements();

    useEffect(() => {
        const ibanPayment = new StripeIBANPayment(selector.payment);
        if (
            selector.state !== "initiate" ||
            selector.payment.type !== PaymentType.CreditCard ||
            !ibanPayment.isValid()
        )
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));

            const response = await axios.post("api/payment_intent/stripe", {
                order: selectorOrder,
                eventId: selectorEvent,
                paymentMethod: "sepa_debit"
            });

            if (response.status === 500)
                throw new Error("Server Error: " + response.data);

            const ibanElement = elements!.getElement(IbanElement);
            const { error, paymentIntent } =
                await stripe!.confirmSepaDebitPayment(
                    response.data.client_secret,
                    {
                        payment_method: {
                            sepa_debit: ibanElement,
                            billing_details: {
                                name:
                                    selectorInformation.address.firstName +
                                    " " +
                                    selectorInformation.address.lastName,
                                email: selectorInformation.email
                            }
                        }
                    }
                );

            if (error || paymentIntent.status !== "succeeded")
                throw new Error(error.message);

            await axios.post(
                "api/payment_intent/stripe_confirm_temp",
                {
                    order: selectorOrder,
                    paymentResult: JSON.stringify(paymentIntent)
                }
            );
            dispatch(setPaymentStatus("finished"));
        }

        processPayment().catch(() => dispatch(setPaymentStatus("failure")));
    }, [
        selector,
        dispatch,
        elements,
        selectorEvent,
        selectorInformation,
        selectorOrder,
        stripe
    ]);

    useEffect(() => {
        const ibanPayment = new StripeIBANPayment(null);
        ibanPayment.setData({
            ibanComplete: state.ibanComplete
        });
        dispatch(setPayment(ibanPayment.data));
    }, [state, dispatch]);

    const onElementChange =
        (field, errorField) =>
        ({ complete, error = { message: null } }) => {
            setState({
                ...state,
                [field]: complete,
                [errorField]: error.message
            });
        };

    const { ibanError } = state;

    return (
        <StripeTextFieldIBAN
            error={Boolean(ibanError)}
            labelErrorMessage={ibanError}
            onChange={onElementChange("ibanComplete", "ibanError")}
            fullWidth
            label={t("payment:sepa-direct-debit-iban")}
        />
    );
};

export const StripeIBANHeader = () => {
    const { t } = useTranslation();
    return <Typography>{t("payment:sepa-direct-debit")}</Typography>;
};
