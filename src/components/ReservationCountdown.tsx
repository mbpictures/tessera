import { Card, Stack, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";
import { selectOrder } from "../store/reducers/orderReducer";
import React, { useEffect, useMemo, useState } from "react";
import useTranslation from "next-translate/useTranslation";
import { useTheme } from "@mui/system";

export const ReservationCountdown = () => {
    const theme = useTheme();
    const order = useAppSelector(selectOrder);
    const expiresAt = useMemo(
        () => order.reservationExpiresAt && new Date(order.reservationExpiresAt),
        [order.reservationExpiresAt]
    );
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
    const {t} = useTranslation();

    useEffect(() => {
        if (!expiresAt) return;
        const update = () => setRemainingSeconds((expiresAt.getTime() - new Date().getTime()) / 1000);

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    const withLeadingZeros = (number) => number < 10 ? "0" + number : number;

    const minutes = Math.floor((remainingSeconds / 60) % 60);
    const seconds = Math.floor(remainingSeconds % 60);
    const isOver = remainingSeconds <= 0;
    return (
        <Card style={{
            padding: `10px 10px ${order.reservationExpiresAt ? 50 : 0}px 10px`,
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            transition: ".3s ease",
            backgroundColor: theme.palette.primary.light
        }}>
            {
                order.reservationExpiresAt && (
                    isOver ? (
                        <Typography variant={"body2"} textAlign={"center"}>{t("common:seat-reservation-time-over")}</Typography>
                    ) : (
                        <Stack direction={"row"} alignItems={"center"} justifyContent={"center"} spacing={2}>
                            <Typography variant={"body2"}>{t("common:time-until-title")}</Typography>
                            <Typography variant={"body2"}><b>{t("common:time-until", {minutes: withLeadingZeros(minutes), seconds: withLeadingZeros(seconds)})}</b></Typography>
                        </Stack>
                    )
                )
            }
        </Card>
    )
}
