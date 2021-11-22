import {getStripe} from "../../lib/stripe";
import {Elements} from "@stripe/react-stripe-js";
import {CheckboxAccordion} from "../CheckboxAccordion";
import {StripeCard} from "./StripeCard";
import {useEffect, useState} from "react";
import {ThemeProvider} from "@mui/system";
import {createTheme} from "@mui/material/styles";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {selectPayment, setPayment} from "../../store/reducers/paymentReducer";
import {PaymentFactory, PaymentType} from "../../store/factories/payment/PaymentFactory";
import {disableNextStep, enableNextStep} from "../../store/reducers/nextStepAvailableReducer";

export const PaymentMethods = () => {
    const selector = useAppSelector(selectPayment);
    const dispatch = useAppDispatch();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentType>(selector.payment?.type ?? null);

    const handleChangeSelectedPaymentMethod = (newMethod) => {
        setSelectedPaymentMethod(newMethod);
    }

    useEffect(() => {
        const valid = (PaymentFactory.getPaymentInstance(selector.payment)?.isValid() ?? false);
        if (valid)
            dispatch(enableNextStep());
        else
            dispatch(disableNextStep());
    }, [selector])

    useEffect(() => {
        if (selectedPaymentMethod === null) {
            dispatch(setPayment(null));
            return;
        }
        dispatch(setPayment({
            type: selectedPaymentMethod,
            data: null
        }));
    }, [selectedPaymentMethod]);

    return (
        <Elements stripe={getStripe()}>
            <ThemeProvider theme={createTheme()}>
                <CheckboxAccordion
                    label={"Credit Card"}
                    name={PaymentType.CreditCard}
                    selectedItem={selectedPaymentMethod}
                    onSelect={handleChangeSelectedPaymentMethod}
                >
                    <StripeCard />
                </CheckboxAccordion>
            </ThemeProvider>
        </Elements>
    )
}
