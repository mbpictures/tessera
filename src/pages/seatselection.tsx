import React from "react";
import {SeatSelectionFree} from "../components/SeatSelectionFree";
import {Typography} from "@mui/material";
import {Step} from "../components/Step";
import {useDispatch} from "react-redux";
import {disableNextStep, enableNextStep} from "../store/reducers/nextStepAvailableReducer";

export default function SeatSelection({direction}) {

    const dispatch = useDispatch();

    const handleChange = (amount: number) => {
        if (amount > 0) {
            dispatch(disableNextStep());
            return;
        }
        dispatch(enableNextStep());
    }

    return (
        <Step direction={direction}>
            <Typography variant={"body1"}>This event has no seat reservation</Typography>
            <SeatSelectionFree onChange={handleChange} />
        </Step>
    );
}
