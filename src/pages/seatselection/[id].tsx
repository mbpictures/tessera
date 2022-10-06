import React from "react";
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

export default function SeatSelection({
    categories,
    direction,
    seatMap,
    seatType,
    fallback,
    eventDate
}) {
    const {t} = useTranslation();
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
            <SeatSelectionFactory seatSelectionDefinition={seatMap} categories={categories} seatType={seatType} />
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
                    seatMap: true,
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
                ticketSaleStartDate: eventDate.ticketSaleStartDate?.toISOString() ?? null,
                ticketSaleEndDate: eventDate.ticketSaleEndDate?.toISOString() ?? null,
                date: eventDate.date?.toISOString() ?? null
            },
            ...(await loadNamespaces({ locale, pathname: '/seatselection/[id]' }))
        }
    };
}
