import {Stack, Typography} from "@mui/material";
import React from 'react';
import {EventSelection} from "../components/EventSelection";
import {Step} from "../components/Step";
import {useAppDispatch} from "../store/hooks";
import {setEvent} from "../store/reducers/eventSelectionReducer";
import prisma from "../lib/prisma";

export default function Home({events, direction}) {
    const dispatch = useAppDispatch();

    const handleChange = (index: number) => {
        dispatch(setEvent(index));
    }

    return (
        <Step direction={direction}>
            <Typography variant={"h1"} align={"center"}>Ticket Shop</Typography>
            <Stack spacing={2}>
                {
                    events.map((event, index) => {
                        return (
                            <EventSelection label={event.title} name={"event_selection"} index={event.id} key={index} onChange={handleChange} />
                        )
                    })
                }
            </Stack>
        </Step>
    );
}

export async function getServerSideProps(context) {
    const events = await prisma.event.findMany();
    return {
        props: {
            events
        }
    }
}
