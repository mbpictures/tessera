import {Typography} from "@mui/material";
import {FUNDING, PayPalButtons, PayPalScriptProvider} from "@paypal/react-paypal-js";
import React from "react";
import axios from "axios";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {IOrder, selectOrder, setOrderId} from "../../store/reducers/orderReducer";
import {setPaymentStatus} from "../../store/reducers/paymentReducer";
import {selectPersonalInformation, setUserId} from "../../store/reducers/personalInformationReducer";
import {selectEventSelected} from "../../store/reducers/eventSelectionReducer";
import {storeOrderAndUser} from "../../constants/util";
import {OnApproveData} from "@paypal/paypal-js/types/components/buttons";

export const PayPal = () => {
    const selectorOrder = useAppSelector(selectOrder);
    const selectedEvent = useAppSelector(selectEventSelected);
    const userInformation = useAppSelector(selectPersonalInformation);
    const dispatch = useAppDispatch();

    const createOrder = async (): Promise<string> => {
        const {userId, orderId} = await storeOrderAndUser(selectorOrder, userInformation, selectedEvent, "paypal");
        dispatch(setOrderId(orderId));
        dispatch(setUserId(userId));
        const newOrder = Object.assign({}, selectorOrder) as IOrder;
        newOrder.orderId = orderId;
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
        await axios.post("api/webhook/paypal", {paypalId: data.orderID, orderId: selectorOrder.orderId});
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
                    fundingSource={FUNDING.PAYPAL}
                />
            </PayPalScriptProvider>
        </>
    )
}
