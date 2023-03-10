import React, { useEffect, useRef, useState } from "react";
import { SeatSelectionMap } from "./seatmap/SeatSelectionMap";
import { SeatSelectionFree } from "./free/SeatSelectionFree";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText, Typography
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectOrder, setReservationExpiresAt, setReservationId, setTickets } from "../../store/reducers/orderReducer";
import {v4 as uuid} from "uuid";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import useTranslation from "next-translate/useTranslation";
import { usePrevious } from "../../constants/hooks";
import isEqual from "lodash/isEqual";
import { executeRequest, RecaptchaResultType } from "../../lib/recaptcha";
import { idempotencyCall } from "../../lib/idempotency/clientsideIdempotency";

export const SeatSelectionFactory = ({
                                         seatType,
                                         categories,
                                         seatSelectionDefinition,
                                         noWrap,
                                         hideSummary,
                                         onSeatAlreadyBooked,
                                         seatMapId,
                                         containsPreview,
                                         currency,
                                         noReservation
}: {
    seatType: string,
    categories: Array<any>,
    seatSelectionDefinition: Array<any>,
    seatMapId?: number,
    noWrap?: boolean,
    hideSummary?: boolean,
    onSeatAlreadyBooked?: Function,
    containsPreview?: boolean
    currency: string;
    noReservation?: boolean;
}) => {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();
    const order = useAppSelector(selectOrder);
    const event = useAppSelector(selectEventSelected);
    const timer = useRef<NodeJS.Timeout>(null);
    const [error, setError] = useState(null);
    const previousTickets = usePrevious(order.tickets);
    const recaptchaValue = useRef(null);

    const sendReservation = async () => {
        if (noReservation) return;
        let reservationId = order.reservationId;
        if (!reservationId) {
            reservationId = uuid();
            dispatch(setReservationId(reservationId))
        }
        if (recaptchaValue.current === null) {
            recaptchaValue.current = await executeRequest(
                process.env.NEXT_PUBLIC_RECAPTCHA_API_KEY,
                "reservation",
                process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE && process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE === "true"
            );
        }
        try {
            // we can retry if the call fails
            const response = await idempotencyCall("/api/order/reservation", {
                token: recaptchaValue.current,
                id: reservationId,
                tickets: order.tickets,
                eventDateId: event
            }, {method: "PUT"});
            if (response.data.invalidTickets && response.data.invalidTickets.length > 0) {
                dispatch(setTickets(response.data.validTickets));
                setError({
                    title: t("common:tickets-already-booked-title"),
                    content: t("common:tickets-already-booked-content"),
                    invalidTickets: response.data.invalidTickets
                })
                if (onSeatAlreadyBooked) onSeatAlreadyBooked();
            }
            dispatch(setReservationExpiresAt(response.data.expiresAt));
        } catch (e) {
            if (e?.response?.data?.error && e.response.data.error === RecaptchaResultType.Timeout) {
                recaptchaValue.current = null;
                return await sendReservation();
            }
            setError({
                title: t("common:unknown-error"),
                content: t("common:ticket-reservation-error-content")
            })
        }
    };

    const cancelReservation = () => {
        if (order.reservationId === undefined) return undefined;
        fetch(
            "/api/order/reservation?id=" + order.reservationId,
            {
                method: "DELETE"
            }
        );
        return undefined;
    };

    useEffect(() => {
        if (isEqual(previousTickets, order.tickets)) return;
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        if (order.tickets.length === 0) {
            cancelReservation();
            dispatch(setReservationExpiresAt(null));
            return;
        }

        // Wait 2s for more seats, so we don't overwhelm server with requests
        timer.current = setTimeout(sendReservation, 2000);
    }, [order.tickets]);

    useEffect(() => {
        window.onbeforeunload = cancelReservation;
    }, [order.reservationId]);

    let seatSelection;
    let containerStyles: React.CSSProperties = {
        alignItems: "center",
        justifyContent: "center"
    };

    switch (seatType) {
        case "seatmap":
            seatSelection = (
                <SeatSelectionMap
                    categories={categories}
                    seatSelectionDefinition={seatSelectionDefinition}
                    hideSummary={hideSummary}
                    seatMapId={seatMapId}
                    containsPreview={containsPreview}
                    currency={currency}
                />
            );
            containerStyles.width = "100%";
            containerStyles.maxHeight = "100%";
            containerStyles.flex = "1 1 auto";
            break;
        case "free":
        default:
            seatSelection = <SeatSelectionFree categories={categories} currency={currency} />;
    }

    return (
        <>
            {
                noWrap ? seatSelection : (
                    <Grid container style={containerStyles}>
                        {seatSelection}
                    </Grid>
                )
            }
            <Dialog open={error !== null} onClose={() => setError(null)} id={"seat-reservation-error"}>
                <DialogTitle>{error?.title}</DialogTitle>
                <DialogContent>
                    {
                        error?.content
                    }
                    {
                        error?.invalidTickets && (
                            <>
                                <Typography>
                                    <b>{t("common:number-of-tickets-unavailable", {ticketAmount: error.invalidTickets.length})}</b>
                                </Typography>
                                <Accordion>
                                    <AccordionSummary>{t("common:view-occupied-tickets")}</AccordionSummary>
                                    <AccordionDetails>
                                        <List>
                                            {
                                                error?.invalidTickets?.map((ticket, index) => {
                                                    const category = categories.find(category => category.id === ticket.categoryId)
                                                    return (
                                                        <ListItem key={index}>
                                                            <ListItemIcon>{index + 1}.</ListItemIcon>
                                                            <ListItemText
                                                                primary={category.label}
                                                                secondary={ticket.seatId && (t("common:seat", {seat: ticket.seatId}))}
                                                            />
                                                        </ListItem>
                                                    )
                                                })
                                            }
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        )
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setError(null)}
                        id={"seat-reservation-error-close"}
                    >
                        {t("common:close")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
