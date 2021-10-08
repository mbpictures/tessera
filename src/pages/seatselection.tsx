import React from "react";
import {SeatSelectionFree} from "../components/SeatSelectionFree";
import {Typography} from "@mui/material";

export default function SeatSelection() {

    return (
        <div className="container">
            <Typography variant={"body1"}>This event has no seat reservation</Typography>
            <SeatSelectionFree />
        </div>
    );
}
