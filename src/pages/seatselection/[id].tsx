import React, { useEffect, useState } from "react";
import { Step } from "../../components/Step";
import prisma from "../../lib/prisma";
import {
    SeatMap
} from "../../components/seatselection/seatmap/SeatSelectionMap";
import { getOption } from "../../lib/options";
import { Options } from "../../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import { SeatSelectionFactory } from "../../components/seatselection/SeatSelectionFactory";
import { eventDateIsBookable } from "../../constants/util";
import useTranslation from "next-translate/useTranslation";
import { getCategoryTicketAmount, getSeatMap } from "../../constants/serverUtil";
import axios from "axios";

export default function SeatSelection({
    categories,
    direction,
    seatMap,
    seatType,
    fallback,
    eventDate,
    seatMapId,
    containsPreview
}) {
    const {t} = useTranslation();
    const [categoriesState, setCategoriesState] = useState(categories);
    const [seatMapState, setSeatMapState] = useState(seatMap);

    const loadData = async () => {
        try {
            const response = await axios.get("/api/bookingInformation/" + eventDate.id);
            setCategoriesState(old => response?.data?.categoryAmount ?? old);
            setSeatMapState(old => response?.data?.seatMap ?? old);
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        setInterval(loadData, 30000);
    }, []);

    if (fallback) return null;
    if (!eventDateIsBookable(eventDate))
        return (
            <h1>{t("common:event-not-bookable")}</h1>
        );

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
            <SeatSelectionFactory seatSelectionDefinition={seatMapState} categories={categoriesState} seatType={seatType} onSeatAlreadyBooked={loadData} seatMapId={seatMapId} containsPreview={containsPreview} />
        </Step>
    );
}

export async function getStaticPaths() {
    const eventDates = await prisma.eventDate.findMany();
    const paths = eventDates.map((eventDate) => ({
        params: {id: eventDate.id.toString()}
    }));
    return { paths, fallback: "blocking"};
}

export async function getStaticProps({ params, locale }) {
    if (params.id === "[id]") return {props: { fallback: true }};

    const eventDate = await prisma.eventDate.findUnique({
        where: {
            id: parseInt(params.id)
        },
        include: {
            event: {
                include: {
                    seatMap: {
                        select: {
                            definition: true,
                            previewType: true
                        }
                    },
                    categories: {
                        include: {
                            category: true
                        }
                    }
                }
            },
            orders: {
                include: {
                    tickets: true
                }
            }
        }
    });

    if (!eventDate) return { notFound: true }

    let seatMap: SeatMap = null;
    if (eventDate.event.seatMap?.definition) {
        seatMap = await getSeatMap(eventDate.id, true);
    }

    const currentAmounts = await getCategoryTicketAmount(eventDate.id);

    return {
        props: {
            categories: eventDate.event.categories.map(category => ({
                ...category.category,
                ticketsLeft: isNaN(category.maxAmount) || !category.maxAmount || category.maxAmount === 0 ? null : Math.max(category.maxAmount - currentAmounts[category.categoryId], 0)
            })),
            seatType: eventDate.event.seatType,
            seatMap,
            theme: await getOption(Options.Theme),
            eventDate: {
                id: eventDate.id,
                ticketSaleStartDate: eventDate.ticketSaleStartDate?.toISOString() ?? null,
                ticketSaleEndDate: eventDate.ticketSaleEndDate?.toISOString() ?? null,
                date: eventDate.date?.toISOString() ?? null
            },
            ...(await loadNamespaces({ locale, pathname: '/seatselection/[id]' })),
            withReservationCountdown: true,
            seatMapId: eventDate.event.seatMapId,
            containsPreview: eventDate.event.seatMap?.previewType !== null
        }
    };
}
