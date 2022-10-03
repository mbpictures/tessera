import React, { useEffect, useRef, useState } from "react";
import { SeatSelectionMap } from "./seatmap/SeatSelectionMap";
import { SeatSelectionFree } from "./free/SeatSelectionFree";
import { Dialog, DialogContent, DialogTitle, Grid, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { selectOrder, setReservationExpiresAt, setReservationId, setTickets } from "../../store/reducers/orderReducer";
import {v4 as uuid} from "uuid";
import axios from "axios";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import useTranslation from "next-translate/useTranslation";
import { usePrevious } from "../../constants/hooks";
import isEqual from "lodash/isEqual";

export const SeatSelectionFactory = ({seatType, categories, seatSelectionDefinition, noWrap, hideSummary}: {seatType: string, categories: Array<any>, seatSelectionDefinition: Array<any>, noWrap?: boolean, hideSummary?: boolean}) => {
    const {t} = useTranslation();
    const dispatch = useAppDispatch();
    const order = useAppSelector(selectOrder);
    const event = useAppSelector(selectEventSelected);
    const timer = useRef<NodeJS.Timeout>(null);
    const [error, setError] = useState(null);
    const previousTickets = usePrevious(order.tickets);

    const sendReservation = async () => {
        let reservationId = order.reservationId;
        if (!reservationId) {
            reservationId = uuid();
            dispatch(setReservationId(reservationId))
        }
        try {
            const response = await axios.put("/api/order/reservation", {
                id: reservationId,
                tickets: order.tickets,
                eventDateId: event
            });
            if (response.data.invalidTickets && response.data.invalidTickets.length > 0) {
                dispatch(setTickets(response.data.validTickets));
                setError({
                    title: t("common:tickets-already-booked-title"),
                    content: t("common:tickets-already-booked-content"),
                    invalidTickets: response.data.invalidTickets
                })
            }
            dispatch(setReservationExpiresAt(response.data.expiresAt));
        } catch (e) {
            // display error
        }
    };

    useEffect(() => {
        if (isEqual(previousTickets, order.tickets)) return;
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }

        // Wait 2s for more seats, so we don't overwhelm server with requests
        timer.current = setTimeout(sendReservation, 2000);
    }, [order.tickets]);

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
                />
            );
            containerStyles.width = "100%";
            break;
        case "free":
        default:
            seatSelection = <SeatSelectionFree categories={categories} />;
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
            <Dialog open={error !== null} onClose={() => setError(null)}>
                <DialogTitle>{error?.title}</DialogTitle>
                <DialogContent>
                    {
                        error?.content
                    }
                    {
                        error?.invalidTickets && (
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
                        )
                    }
                </DialogContent>
            </Dialog>
        </>
    );
}
