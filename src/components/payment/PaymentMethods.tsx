import { getStripe } from "../../lib/stripe";
import { Elements } from "@stripe/react-stripe-js";
import { CheckboxAccordion } from "../CheckboxAccordion";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectPayment, setPayment } from "../../store/reducers/paymentReducer";
import {
    PaymentFactory,
    PaymentType
} from "../../store/factories/payment/PaymentFactory";
import { formatPrice } from "../../constants/util";

export const PaymentMethods = ({ paymentMethods, paymentFees, categories }) => {
    const selector = useAppSelector(selectPayment);
    const dispatch = useAppDispatch();
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentType>(selector.payment?.type ?? null);

    const handleChangeSelectedPaymentMethod = (newMethod) => {
        setSelectedPaymentMethod(newMethod);
    };

    useEffect(() => {
        if (selectedPaymentMethod === null) {
            dispatch(setPayment(null));
            return;
        }
        dispatch(
            setPayment({
                type: selectedPaymentMethod,
                data: null
            })
        );
    }, [selectedPaymentMethod, dispatch]);

    return (
        <Elements stripe={getStripe()}>
            {
                PaymentFactory.getAllPaymentInstances()
                    .filter(payment => paymentMethods.includes(payment.data.type))
                    .map((value, index) => {
                        return (
                            <CheckboxAccordion
                                label={
                                    <>
                                        {
                                            value.getHeaderComponent()
                                        }
                                        {
                                            paymentFees[value.data.type] !== 0 && (
                                                ` (${paymentFees[value.data.type] > 0 ? "+" : ""}${formatPrice(paymentFees[value.data.type], categories[0].currency)})`
                                            )
                                        }
                                    </>
                                }
                                name={value.data.type}
                                selectedItem={selectedPaymentMethod}
                                onSelect={handleChangeSelectedPaymentMethod}
                                key={index}
                            >
                                {value.getComponent()}
                            </CheckboxAccordion>
                        );
                    })
            }
        </Elements>
    );
};
