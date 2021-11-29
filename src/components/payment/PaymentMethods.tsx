import {getStripe} from "../../lib/stripe";
import {Elements} from "@stripe/react-stripe-js";
import {CheckboxAccordion} from "../CheckboxAccordion";
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
                {
                    PaymentFactory.getAllPaymentInstances().map((value, index) => {
                        return (
                            <CheckboxAccordion
                                label={value.getHeaderComponent()}
                                name={value.data.type}
                                selectedItem={selectedPaymentMethod}
                                onSelect={handleChangeSelectedPaymentMethod}
                                key={index}
                            >
                                {value.getComponent()}
                            </CheckboxAccordion>
                        )
                    })
                }
            </ThemeProvider>
        </Elements>
    )
}
