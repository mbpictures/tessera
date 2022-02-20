import { Typography } from "@mui/material";
import React from "react";
import { Step } from "../components/Step";
import { useAppDispatch } from "../store/hooks";
import { setEvent } from "../store/reducers/eventSelectionReducer";
import prisma from "../lib/prisma";
import { GalleryEventSelection } from "../components/EventSelection/GalleryEventSelection";
import { EventSelection } from "../components/EventSelection/EventSelection";

export default function Home({ events, direction }) {
    const dispatch = useAppDispatch();

    const handleChange = (index: number) => {
        dispatch(setEvent(index));
    };

    const gallery = events.filter(event => !event.coverImage).length === 0;

    return (
        <Step direction={direction} style={{width: gallery ? "100%" : "auto"}}>
            <Typography variant={"h1"} align={"center"}>
                Ticket Shop
            </Typography>
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
            events
        }
    };
}
