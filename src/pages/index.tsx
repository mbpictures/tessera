import { Typography } from "@mui/material";
import React from "react";
import { Step } from "../components/Step";
import { useAppDispatch } from "../store/hooks";
import { setEvent } from "../store/reducers/eventSelectionReducer";
import prisma from "../lib/prisma";
import { GalleryEventSelection } from "../components/EventSelection/GalleryEventSelection";
import { EventSelection } from "../components/EventSelection/EventSelection";
import { getOption } from "../lib/options";
import { Options } from "../constants/Constants";
import loadNamespaces from "next-translate/loadNamespaces";

export default function Home({ events, direction, title, subtitle }) {
    const dispatch = useAppDispatch();

    const handleChange = (index: number) => {
        dispatch(setEvent(index));
    };

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
    const events = await prisma.event.findMany();
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
