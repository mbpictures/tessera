import React from "react";
import { Grid } from "@mui/material";
import { Step } from "../../components/Step";
import prisma from "../../lib/prisma";
import { SeatSelectionFree } from "../../components/SeatSelectionFree";
import {
    SeatMap,
    SeatSelectionMap
} from "../../components/seatmap/SeatSelectionMap";
import { SeatOrder } from "../../store/reducers/orderReducer";
import { getOption } from "../../lib/options";
import { Options } from "../../constants/Constants";

export default function SeatSelection({
    categories,
    direction,
    seatMap,
    seatType,
    fallback
}) {
    if (fallback) return null;

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
                    seatSelectionDefinition={seatMap}
                />
            );
            containerStyles.width = "100%";
            break;
        case "free":
        default:
            seatSelection = <SeatSelectionFree categories={categories} />;
    }

    return (
        <Step
            direction={direction}
            style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                width: "100%",
                height: seatType === "seatmap" ? "100%" : "auto"
            }}
        >
            <Grid container style={containerStyles}>
                {seatSelection}
            </Grid>
        </Step>
    );
}

export async function getStaticPaths() {
    const events = await prisma.event.findMany();
    const paths = events.map((event) => ({
        params: {id: event.id.toString()}
    }));
    return { paths, fallback: "blocking"};
}

export async function getStaticProps({ params }) {
    if (params.id === "[id]") return {props: { fallback: true }};
    const categories = await prisma.category.findMany({
        where: {
            events: {
                some: {
                    eventId: parseInt(params.id)
                }
            }
        }
    });

    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(params.id)
        },
        include: {
            seatMap: true,
            orders: true
        }
    });

    if (!event) return { notFound: true }

    let seatmap: SeatMap = null;
    if (event.seatMap?.definition) {
        const baseMap: SeatMap = JSON.parse(event.seatMap?.definition);
        seatmap = baseMap.map((row) =>
            row.map((seat) => {
                const isOccupied = event.orders.some((order) =>
                    (JSON.parse(order.order) as SeatOrder).seats.some(
                        (value) => value.id === seat.id
                    )
                );
                return {
                    ...seat,
                    occupied: isOccupied
                };
            })
        );
    }

    return {
        props: {
            categories,
            seatType: event.seatType,
            seatMap: seatmap,
            theme: await getOption(Options.Theme)
        }
    };
}
