import React from "react";
import {Grid} from "@mui/material";
import {Step} from "../components/Step";
import prisma from "../lib/prisma";
import {SeatSelectionFree} from "../components/SeatSelectionFree";
import {SeatSelectionMap} from "../components/seatmap/SeatSelectionMap";

export default function SeatSelection({categories, direction, seatMap, seatType}) {
    let seatSelection;
    let containerStyles: React.CSSProperties = {alignItems: "center", justifyContent: "center"};
    switch (seatType) {
        case "seatmap":
            seatSelection = <SeatSelectionMap categories={categories} seatSelectionDefinition={seatMap} />;
            containerStyles.width = "100%";
            break;
        case "free":
        default:
            seatSelection = <SeatSelectionFree categories={categories} />
    }

    return (
        <Step direction={direction} style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%", height: seatType === "seatmap" ? "100%" : "auto"}}>
            <Grid container style={containerStyles}>
                {
                    seatSelection
                }
            </Grid>
        </Step>
    );
}

export async function getServerSideProps(context) {
    const categories = await prisma.category.findMany({
        where: {
            events: {
                some: {
                    eventId: parseInt(context.query.event)
                }
            }
        }
    });

    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(context.query.event)
        },
        include: {
            seatMap: true
        }
    });

    return {
        props: {
            categories,
            seatType: event.seatType,
            seatMap: event.seatMap?.definition ? JSON.parse(event.seatMap?.definition) : null
        }
    }
}
