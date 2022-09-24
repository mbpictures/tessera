import { Typography } from "@mui/material";
import React, { useEffect } from "react";
import { Step } from "../components/Step";
import { useAppDispatch } from "../store/hooks";
import { setEvent } from "../store/reducers/eventSelectionReducer";
import prisma from "../lib/prisma";
import { GalleryEventSelection } from "../components/EventSelection/GalleryEventSelection";
import { EventSelection } from "../components/EventSelection/EventSelection";
import { getOption } from "../lib/options";
import { Options } from "../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";
import { resetOrder } from "../store/reducers/orderReducer";

export default function Home({ events, direction, title, subtitle }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(resetOrder());
    }, []);

    const handleChange = (index: number) => {
        dispatch(setEvent(index));
    };

    // we filter events client side, as we have to update server very often otherwise
    events = events.map(event => {
        const currentDate = new Date();
        return {
            ...event,
            dates: event.dates.filter(date => {
                const isAfterRegistration = date.ticketSaleStartDate !== null ? new Date(date.ticketSaleStartDate).getTime() < currentDate.getTime() : true;
                const endDate = date.ticketSaleEndDate ?? date.date;
                const isBeforeEnd = endDate !== null ? new Date(endDate).getTime() > currentDate.getTime() : true;
                return isAfterRegistration && isBeforeEnd;
            })
        };
    }).filter(event => event.dates.length > 0);
    const gallery = events.filter(event => !event.coverImage).length === 0;

    return (
        <Step direction={direction} style={{width: "100%"}}>
            <Typography variant={"h1"} align={"center"} id={"shop-title"}>
                {title}
            </Typography>
            {
                subtitle && (
                    <Typography variant={"h3"} align={"center"} id={"shop-subtitle"}>
                        {subtitle}
                    </Typography>
                )
            }
            {
                gallery ? (
                    <GalleryEventSelection events={events} onChange={handleChange} />
                ) : (
                    <EventSelection events={events} onChange={handleChange} />
                )
            }
        </Step>
    );
}

export async function getStaticProps({ locale }) {
    const events = (await prisma.event.findMany({
        include: {
            dates: true
        }
    }))
        .map(event =>
            ({
                ...event,
                dates: event.dates
                    .map(date => ({
                        ...date,
                        date: date.date?.toISOString() ?? null,
                        ticketSaleStartDate: date.ticketSaleStartDate?.toISOString() ?? null,
                        ticketSaleEndDate: date.ticketSaleEndDate?.toISOString() ?? null
                    }))
            })
        );
    return {
        props: {
            events,
            title: await getOption(Options.ShopTitle),
            subtitle: await getOption(Options.ShopSubtitle),
            theme: await getOption(Options.Theme),
            ...(await loadNamespaces({ locale, pathname: '/' }))
        }
    };
}
