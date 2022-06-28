import React from "react";
import { SeatSelectionMap } from "./seatmap/SeatSelectionMap";
import { SeatSelectionFree } from "./free/SeatSelectionFree";
import { Grid } from "@mui/material";

export const SeatSelectionFactory = ({seatType, categories, seatSelectionDefinition, noWrap, hideSummary}: {seatType: string, categories: Array<any>, seatSelectionDefinition: Array<any>, noWrap?: boolean, hideSummary?: boolean}) => {
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

    return noWrap ? seatSelection : (
        <Grid container style={containerStyles}>
            {seatSelection}
        </Grid>
    );
}
