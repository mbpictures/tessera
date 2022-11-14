import { Step } from "../components/Step";
import { Button, Stack, Typography } from "@mui/material";
import { getOption } from "../lib/options";
import { Options, STEP_URLS } from "../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { useAppSelector } from "../store/hooks";
import { selectPayment } from "../store/reducers/paymentReducer";
import { selectOrder } from "../store/reducers/orderReducer";
import { SuccessAnimated } from "../components/SuccessAnimated";

export default function Checkout({ direction }) {
    const { t } = useTranslation();
    const router = useRouter();
    const notificationSent = useRef(false);
    const paymentSelector = useAppSelector(selectPayment);
    const orderSelector = useAppSelector(selectOrder);

    useEffect(() => {
        if (!router.isReady || notificationSent.current) return;

        notificationSent.current = true;
        const {order: orderId, payment} = router.query;
        axios.post("/api/order/checkout_complete_notification", {
            orderId: orderSelector.orderId ?? orderId,
            payment: paymentSelector.payment.type ?? payment
        }).catch(console.log);
    }, [router, notificationSent.current]);

    const handleBackToStart = async () => {
        await router.push(STEP_URLS[0]);
    }

    return (
        <Step
            direction={direction}
            style={{ width: "100%", maxHeight: "100%" }}
        >
            <Stack
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
                spacing={2}
            >
                <SuccessAnimated />
                <Typography variant="h3" align={"center"}>
                    {t("checkout:checkout-complete")}
                </Typography>
                <Button onClick={handleBackToStart} color={"primary"} variant={"outlined"} id={"back-to-start"}>
                    {t("checkout:back-to-start")}
                </Button>
            </Stack>
        </Step>
    );
}

export async function getStaticProps({ locale }) {
    return {
        props: {
            theme: await getOption(Options.Theme),
            ...(await loadNamespaces({ locale, pathname: '/checkout' }))
        }
    }
}
