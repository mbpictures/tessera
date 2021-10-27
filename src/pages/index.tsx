import {Stack, Typography} from "@mui/material";
import React, {useEffect} from 'react';
import {EventSelection} from "../components/EventSelection";
import {Step} from "../components/Step";
import {useAppDispatch, useAppSelector} from "../store/hooks";
import {selectEventSelected, setEvent} from "../store/reducers/eventSelectionReducer";
import {enableNextStep} from "../store/reducers/nextStepAvailableReducer";
import prisma from "../lib/prisma";

export default function Home({events, direction}) {
    const dispatch = useAppDispatch();
    const currentEventSelected = useAppSelector(selectEventSelected);

    useEffect(() => {
        if (currentEventSelected < 0) return;
        dispatch(enableNextStep());
    }, []);

    const handleChange = (index: number) => {
        dispatch(setEvent(index));
        dispatch(enableNextStep());
    }

    return (
        <Step direction={direction}>
            <Typography variant={"h1"} align={"center"}>Ticket Shop</Typography>
            <Stack spacing={2}>
                {
                    events.map((event, index) => {
                        return (
                            <EventSelection label={event.title} name={"event_selection"} index={index} key={index} onChange={handleChange} />
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
