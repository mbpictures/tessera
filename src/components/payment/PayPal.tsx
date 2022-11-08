import {
    PayPalButtons,
    PayPalScriptProvider
} from "@paypal/react-paypal-js";
import React, { useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    OrderState,
    selectOrder,
    setOrderId
} from "../../store/reducers/orderReducer";
import { selectPayment, setIdempotencyKey, setPaymentStatus } from "../../store/reducers/paymentReducer";
import {
    selectPersonalInformation,
    setUserId
} from "../../store/reducers/personalInformationReducer";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import { storeOrderAndUser, validatePayment } from "../../constants/util";
import {
    OnApproveData,
    OnClickActions
} from "@paypal/paypal-js/types/components/buttons";
import logo from "../../assets/payment/paypal.svg";
import Image from "next/image";
import { v4 as uuid } from "uuid";
import { idempotencyCall } from "../../lib/idempotency/clientsideIdempotency";

export const PayPal = () => {
    const selectorOrder = useAppSelector(selectOrder);
    const selectedEvent = useAppSelector(selectEventSelected);
    const userInformation = useAppSelector(selectPersonalInformation);
    const payment = useAppSelector(selectPayment);
    const dispatch = useAppDispatch();

    const orderIdRef = useRef<string>(null);

    const click = async (data, actions: OnClickActions) => {
        const paymentAlreadyValid = await validatePayment(
            orderIdRef.current ? orderIdRef.current : selectorOrder.orderId,
            true
        );
        if (paymentAlreadyValid) {
            dispatch(setPaymentStatus("finished"));
            return actions.reject();
        }
        return actions.resolve();
    };

    const createOrder = async (): Promise<string> => {
        let idempotencyKey = payment.idempotencyKey;
        if (idempotencyKey === null) {
            // generate payment request overarching idempotencyKey
            idempotencyKey = uuid();
            dispatch(setIdempotencyKey(idempotencyKey));
        }
        const { userId, orderId } = await storeOrderAndUser(
            selectorOrder,
            userInformation,
            selectedEvent,
            "paypal",
            idempotencyKey
        );
        dispatch(setOrderId(orderId));
        dispatch(setUserId(userId));
        const newOrder = Object.assign({}, selectorOrder) as OrderState;
        newOrder.orderId = orderId;
        orderIdRef.current = orderId;
        const response = await idempotencyCall("api/payment_intent/paypal", {
            order: newOrder
        });
        if (response.status === 201) {
            return null;
        }
        return response.data.orderId;
    };

    const onFailed = () => {
        dispatch(setPaymentStatus("failure"));
    };

    const onApproved = async (data: OnApproveData) => {
        const response = await idempotencyCall("api/webhook/paypal", {
            paypalId: data.orderID,
            orderId: orderIdRef.current
        });
        if (response.status !== 200) {
            dispatch(setPaymentStatus("failure"));
            return;
        }
        dispatch(setPaymentStatus("finished"));
    };

    if (!payment.gtcAccepted) return null;

    return (
        <>
            <PayPalScriptProvider
                options={{
                    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                    currency: payment.currency
                }}
            >
                <PayPalButtons
                    style={{
                        color: "blue",
                        layout: "horizontal",
                        label: "buynow",
                        tagline: false
                    }}
                    createOrder={createOrder}
                    onError={onFailed}
                    onCancel={onFailed}
                    onApprove={onApproved}
                    onClick={click}
                    fundingSource={"paypal"}
                />
            </PayPalScriptProvider>
        </>
    );
};

export const PayPalHeader = () => {
    return <Image src={logo} height={20} alt="PayPal Logo" />;
};
