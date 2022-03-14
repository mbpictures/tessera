import {
    selectPayment,
    setPaymentStatus
} from "../../../store/reducers/paymentReducer";
import { storeOrderAndUser, validatePayment } from "../../../constants/util";
import {
    selectPersonalInformation,
    setUserId
} from "../../../store/reducers/personalInformationReducer";
import { selectOrder, setOrderId } from "../../../store/reducers/orderReducer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectEventSelected } from "../../../store/reducers/eventSelectionReducer";
import PaymentIcon from "@mui/icons-material/Payment";
import { LoadingButton } from "@mui/lab";
import React from "react";
import { selectNextStateAvailable } from "../../../store/reducers/nextStepAvailableReducer";
import useTranslation from "next-translate/useTranslation";

export const PayButton = () => {
    const order = useAppSelector(selectOrder);
    const payment = useAppSelector(selectPayment);
    const selectedEvent = useAppSelector(selectEventSelected);
    const userInformation = useAppSelector(selectPersonalInformation);
    const nextEnabled = useAppSelector(selectNextStateAvailable);
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const onPay = async () => {
        dispatch(setPaymentStatus("persist"));
        const paymentAlreadyValid = await validatePayment(order.orderId);
        if (paymentAlreadyValid) {
            dispatch(setPaymentStatus("finished"));
        }
        try {
            const { userId, orderId } = await storeOrderAndUser(
                order,
                userInformation,
                selectedEvent,
                payment.payment.type
            );
            dispatch(setUserId(userId));
            dispatch(setOrderId(orderId));
            dispatch(setPaymentStatus("initiate"));
        } catch (e) {
            dispatch(setPaymentStatus("failure"));
        }
    };

    return (
        <LoadingButton
            loadingPosition="start"
            variant="outlined"
            fullWidth
            disabled={!nextEnabled}
            onClick={onPay}
            loading={
                payment.state === "processing" ||
                payment.state === "persist" ||
                payment.state === "initiate"
            }
            startIcon={<PaymentIcon />}
            id="pay-button"
        >
            {payment.state === "processing" ||
            payment.state === "persist" ||
            payment.state === "initiate"
                ? t("payment:processing")
                : t("payment:pay-now")}
        </LoadingButton>
    );
};
