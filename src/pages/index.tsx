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

export default function Home({ events, direction, title, subtitle }) {
    const dispatch = useAppDispatch();

    const handleChange = (index: number) => {
        dispatch(setEvent(index));
    };

    const gallery = events.filter(event => !event.coverImage).length === 0;

    return (
        <Step direction={direction} style={{width: gallery ? "100%" : "auto"}}>
            <Typography variant={"h1"} align={"center"}>
                {title}
            </Typography>
            {
                subtitle && (
                    <Typography variant={"h3"} align={"center"}>
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

export async function getServerSideProps(context) {
    const events = await prisma.event.findMany();
    return {
        props: {
            events,
            title: await getOption(Options.ShopTitle),
            subtitle: await getOption(Options.ShopSubtitle)
        }
    };
}
