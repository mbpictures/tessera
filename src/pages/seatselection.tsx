import React from "react";
import {SeatSelectionFree} from "../components/SeatSelectionFree";
import {Typography} from "@mui/material";
import {Step} from "../components/Step";

export default function SeatSelection({direction}) {

    return (
        <Step direction={direction}>
            <Typography variant={"body1"}>This event has no seat reservation</Typography>
            <SeatSelectionFree />
        </Step>
    );
}
