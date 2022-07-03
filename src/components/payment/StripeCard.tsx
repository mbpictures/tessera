import { Grid, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { StripeTextFieldCVC, StripeTextFieldExpiry, StripeTextFieldNumber } from "./stripe/StripeElementWrapper";
import { CardNumberElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectPayment, setPayment, setPaymentStatus } from "../../store/reducers/paymentReducer";
import { CreditCardPayment } from "../../store/factories/payment/CreditCardPayment";
import { PaymentType } from "../../store/factories/payment/PaymentFactory";
import axios from "axios";
import { selectOrder } from "../../store/reducers/orderReducer";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import { useTranslation } from "next-i18next";

export const StripeCard = () => {
    const selector = useAppSelector(selectPayment);
    const selectorOrder = useAppSelector(selectOrder);
    const selectorEvent = useAppSelector(selectEventSelected);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const stripe = useStripe();

    const [state, setState] = React.useState({
        cardNumberComplete: false,
        expiredComplete: false,
        cvcComplete: false,
        cardNumberError: null,
        expiredError: null,
        cvcError: null
    });
    const [cardHolderName, setCardHolderName] = useState<string>("");

    const elements = useElements();

    useEffect(() => {
        const creditCardPayment = new CreditCardPayment(selector.payment);
        if (
            selector.state !== "initiate" ||
            selector.payment.type !== PaymentType.CreditCard ||
            !creditCardPayment.isValid()
        )
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));

            const response = await axios.post(
                "api/payment_intent/stripe_credit_card",
                { order: selectorOrder, eventId: selectorEvent }
            );

            if (response.status === 500)
                throw new Error("Server Error: " + response.data);

            const cardElement = elements!.getElement(CardNumberElement);
            const { error, paymentIntent } = await stripe!.confirmCardPayment(
                response.data.client_secret,
                {
                    payment_method: {
                        card: cardElement!,
                        billing_details: { name: cardHolderName }
                    }
                }
            );

            if (error || paymentIntent.status !== "succeeded")
                throw new Error(error.message);

            await axios.post(
                "api/payment_intent/stripe_credit_card_confirm_temp",
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
        cardHolderName,
        dispatch,
        elements,
        selectorOrder,
        selectorEvent,
        stripe
    ]);

    useEffect(() => {
        const creditCardPayment = new CreditCardPayment(null);
        creditCardPayment.setData({
            cardNumberComplete: state.cardNumberComplete,
            expiredComplete: state.expiredComplete,
            cvcComplete: state.cvcComplete
        });
        dispatch(setPayment(creditCardPayment.data));
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

    const { cardNumberError, expiredError, cvcError } = state;

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
                <TextField
                    label={t("payment:credit-card-name")}
                    required
                    onChange={(event) => setCardHolderName(event.target.value)}
                    value={cardHolderName}
                    variant={"outlined"}
                    fullWidth
                    id={"stripe-card-name"}
                />
            </Grid>
            <Grid item xs={12} md={12}>
                <StripeTextFieldNumber
                    error={Boolean(cardNumberError)}
                    labelErrorMessage={cardNumberError}
                    onChange={onElementChange(
                        "cardNumberComplete",
                        "cardNumberError"
                    )}
                    id={"stripe-card-number"}
                    label={t("payment:credit-card-number")}
                />
            </Grid>
            <Grid item xs={6} sm={6}>
                <StripeTextFieldExpiry
                    error={Boolean(expiredError)}
                    labelErrorMessage={expiredError}
                    onChange={onElementChange(
                        "expiredComplete",
                        "expiredError"
                    )}
                    id={"stripe-card-expire"}
                    label={t("payment:credit-card-expires")}
                />
            </Grid>
            <Grid item xs={6} sm={6}>
                <StripeTextFieldCVC
                    error={Boolean(cvcError)}
                    labelErrorMessage={cvcError}
                    onChange={onElementChange("cvcComplete", "cvcError")}
                    id={"stripe-card-cvc"}
                    label={t("payment:credit-card-cvc")}
                />
            </Grid>
        </Grid>
    );
};

export const StripeCardHeader = () => {
    const { t } = useTranslation();
    return <Typography>{t("payment:credit-card")}</Typography>;
};
