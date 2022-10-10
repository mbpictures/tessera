import { Card, List, ListItem, ListItemText, ListSubheader, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";
import { selectOrder } from "../store/reducers/orderReducer";
import React, { useEffect, useMemo, useState } from "react";
import useTranslation from "next-translate/useTranslation";

export const ReservationCountdown = () => {
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

    if (!order.reservationExpiresAt) return null;

    const minutes = Math.floor((remainingSeconds / 60) % 60);
    const seconds = Math.floor(remainingSeconds % 60);
    const isOver = remainingSeconds <= 0;
    return (
        <Card style={{padding: "10px"}}>
            {
                isOver ? (
                    <Typography>{t("common:seat-reservation-time-over")}</Typography>
                ) : (
                    <List
                        subheader={
                            <ListSubheader>
                                <Typography variant="h6">
                                    {t("common:time-until-title")}
                                </Typography>
                            </ListSubheader>
                        }
                    >
                        <ListItem sx={{pt: 0, pb: 0}}>
                            <ListItemText>
                                <b>{t("common:time-until", {minutes, seconds})}</b>
                            </ListItemText>
                        </ListItem>
                    </List>
                )
            }
        </Card>
    )
}
