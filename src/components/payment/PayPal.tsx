import {Typography} from "@mui/material";
import {FUNDING, PayPalButtons, PayPalScriptProvider} from "@paypal/react-paypal-js";
import React, {useRef} from "react";
import axios from "axios";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {IOrder, selectOrder, setOrderId} from "../../store/reducers/orderReducer";
import {setPaymentStatus} from "../../store/reducers/paymentReducer";
import {selectPersonalInformation, setUserId} from "../../store/reducers/personalInformationReducer";
import {selectEventSelected} from "../../store/reducers/eventSelectionReducer";
import {storeOrderAndUser, validatePayment} from "../../constants/util";
import {OnApproveData, OnClickActions} from "@paypal/paypal-js/types/components/buttons";

export const PayPal = () => {
    const selectorOrder = useAppSelector(selectOrder);
    const selectedEvent = useAppSelector(selectEventSelected);
    const userInformation = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const orderIdRef = useRef<string>(null);

    const click = async (data, actions: OnClickActions) => {
        const paymentAlreadyValid = await validatePayment(orderIdRef.current ? orderIdRef.current : selectorOrder.orderId);
        if (paymentAlreadyValid) {
            dispatch(setPaymentStatus("finished"));
            return actions.reject();
        }
        return actions.resolve();
    };

    const createOrder = async (): Promise<string> => {
        const {userId, orderId} = await storeOrderAndUser(selectorOrder, userInformation, selectedEvent, "paypal");
        dispatch(setOrderId(orderId));
        dispatch(setUserId(userId));
        const newOrder = Object.assign({}, selectorOrder) as IOrder;
        newOrder.orderId = orderId;
        orderIdRef.current = orderId;
        const response = await axios.post("api/payment_intent/paypal", {order: newOrder});
        if (response.status === 201) {
            return null;
        }
        return response.data.orderId;
    };

    const onFailed = () => {
        dispatch(setPaymentStatus("failure"));
    };

    const onApproved = async (data: OnApproveData) => {
        const response = await axios.post("api/webhook/paypal", {paypalId: data.orderID, orderId: orderIdRef.current});
        if (response.status !== 200) {
            dispatch(setPaymentStatus("failure"));
            return;
        }
        dispatch(setPaymentStatus("finished"));
    };

    return (
        <>
            <Typography align={"center"} paddingBottom={2} paddingTop={2}>or</Typography>
            <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, currency: "USD" }}>
                <PayPalButtons
                    style={{
                        color: 'blue',
                        layout: 'horizontal',
                        label: 'buynow',
                        tagline: false,
                    }}
                    createOrder={createOrder}
                    onError={onFailed}
                    onCancel={onFailed}
                    onApprove={onApproved}
                    onClick={click}
                    fundingSource={FUNDING.PAYPAL}
                />
            </PayPalScriptProvider>
        </>
    )
}
