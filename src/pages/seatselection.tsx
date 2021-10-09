import React from "react";
import {SeatSelectionFree} from "../components/SeatSelectionFree";
import {Typography} from "@mui/material";
import {Step} from "../components/Step";
import {useDispatch} from "react-redux";
import {disableNextStep, enableNextStep} from "../store/reducers/nextStepAvailableReducer";
import {setOrder} from "../store/reducers/orderReducer";

export default function SeatSelection({direction}) {

    const dispatch = useDispatch();

    const handleChange = (amount: number) => {
        dispatch(setOrder({ticketAmount: amount}));
        if (amount > 0) {
            dispatch(enableNextStep());
            return;
        }
        dispatch(disableNextStep());
    }

    return (
        <Step direction={direction}>
            <Typography variant={"body1"}>This event has no seat reservation</Typography>
            <SeatSelectionFree onChange={handleChange} />
        </Step>
    );
}
