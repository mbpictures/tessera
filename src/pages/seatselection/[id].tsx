import React from "react";
import { Step } from "../../components/Step";
import prisma from "../../lib/prisma";
import {
    SeatMap
} from "../../components/seatselection/seatmap/SeatSelectionMap";
import { SeatOrder } from "../../store/reducers/orderReducer";
import { getOption } from "../../lib/options";
import { Options } from "../../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import { SeatSelectionFactory } from "../../components/seatselection/SeatSelectionFactory";

export default function SeatSelection({
    categories,
    direction,
    seatMap,
    seatType,
    fallback
}) {
    if (fallback) return null;

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
            <SeatSelectionFactory seatSelectionDefinition={seatMap} categories={categories} seatType={seatType} />
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

export async function getStaticProps({ params, locale }) {
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
            theme: await getOption(Options.Theme),
            ...(await loadNamespaces({ locale, pathname: '/seatselection/[id]' }))
        }
    };
}
