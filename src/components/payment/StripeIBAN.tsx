import React, {useEffect} from "react";
import {
    StripeTextFieldIBAN
} from "./stripe/StripeElementWrapper";
import {IbanElement, useElements, useStripe} from "@stripe/react-stripe-js";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {selectPayment, setPayment, setPaymentStatus} from "../../store/reducers/paymentReducer";
import {PaymentType} from "../../store/factories/payment/PaymentFactory";
import axios from "axios";
import {selectOrder} from "../../store/reducers/orderReducer";
import {selectEventSelected} from "../../store/reducers/eventSelectionReducer";
import {selectPersonalInformation} from "../../store/reducers/personalInformationReducer";
import {StripeIBANPayment} from "../../store/factories/payment/StripeIBANPayment";
import {Typography} from "@mui/material";

export const StripeIBAN = () => {
    const selector = useAppSelector(selectPayment);
    const selectorOrder = useAppSelector(selectOrder);
    const selectorEvent = useAppSelector(selectEventSelected);
    const selectorInformation = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const stripe = useStripe();

    const ibanPayment = new StripeIBANPayment(selector.payment);

    const [state, setState] = React.useState({
        ibanComplete: false,
        ibanError: null
    });

    const elements = useElements();

    useEffect(() => {
        if (selector.state !== "initiate" || selector.payment.type !== PaymentType.CreditCard || !ibanPayment.isValid())
            return;

        async function processPayment() {
            dispatch(setPaymentStatus("processing"));

            const response = await axios.post("api/payment_intent", {order: selectorOrder, eventId: selectorEvent});

            if (response.status === 500)
                throw new Error("Server Error: " + response.data)

            const ibanElement = elements!.getElement(IbanElement);
            const { error, paymentIntent } = await stripe!.confirmSepaDebitPayment(response.data.client_secret, {
                payment_method: {
                    sepa_debit: ibanElement,
                    billing_details: {
                        name: selectorInformation.address.firstName + " " + selectorInformation.address.lastName,
                        email: selectorInformation.email
                    }
                }
            });

            if (error || paymentIntent.status !== "succeeded")
                throw new Error(error.message)
            dispatch(setPaymentStatus("finished"));
        }

        processPayment().catch(() => dispatch(setPaymentStatus("failure")));

    }, [selector]);

    useEffect(() => {
        ibanPayment.setData({
            ibanComplete: state.ibanComplete
        })
        dispatch(setPayment(ibanPayment.data));
    }, [state]);

    const onElementChange = (field, errorField) => ({complete, error = { message: null }}) => {
        setState({ ...state, [field]: complete, [errorField]: error.message });
    };

    const {ibanError} = state;

    return (
        <StripeTextFieldIBAN
            error={Boolean(ibanError)}
            labelErrorMessage={ibanError}
            onChange={onElementChange("ibanComplete", "ibanError")}
            fullWidth
        />
    )
};

export const StripeIBANHeader = () => {
    return (
        <Typography>SEPA Direct Debit</Typography>
    )
}