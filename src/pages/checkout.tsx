import { motion } from "framer-motion";
import { Step } from "../components/Step";
import { Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { getOption } from "../lib/options";
import { Options, STEP_URLS } from "../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import useTranslation from "next-translate/useTranslation";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Checkout({ direction }) {
    const theme = useTheme();
    const { t } = useTranslation();
    const router = useRouter();
    const notificationSent = useRef(false);

    useEffect(() => {
        if (!router.isReady || notificationSent.current) return;

        const {order: orderId, payment} = router.query;
        axios.post("/api/order/checkout_complete_notification", {
            orderId,
            payment
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
                <svg
                    className="progress-icon"
                    viewBox="0 0 50 50"
                    style={{ maxWidth: 300, maxHeight: 300 }}
                >
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={theme.palette.success.main}
                        d="M 0, 20 a 20, 20 0 1,0 40,0 a 20, 20 0 1,0 -40,0"
                        style={{ translateX: 5, translateY: 5 }}
                        animate={{
                            pathLength: 1,
                            transition: {
                                delay: 0.1,
                                duration: 0.3
                            }
                        }}
                        initial={{
                            pathLength: 0
                        }}
                    />
                    <motion.path
                        fill="none"
                        strokeWidth="2"
                        stroke={theme.palette.success.main}
                        d="M14,26 L 22,33 L 35,16"
                        strokeDasharray="0 1"
                        animate={{
                            pathLength: 1,
                            transition: {
                                delay: 0.4,
                                duration: 0.3
                            }
                        }}
                        initial={{
                            pathLength: 0
                        }}
                    />
                </svg>
                <Typography variant="h3" align={"center"}>
                    {t("checkout:checkout-complete")}
                </Typography>
                <Button onClick={handleBackToStart} color={"primary"} variant={"outlined"}>
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
