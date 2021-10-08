import Head from 'next/head';
import {Stack, Typography} from "@mui/material";
import React from 'react';
import {EventSelection} from "../components/EventSelection";
import {EVENT_SELECTION_KEY} from "../constants/Constants";
import {StepperContainer} from "../components/StepperContainer";

export default function Home({events}) {

    const handleChange = (index: number) => {
        window.localStorage.setItem(EVENT_SELECTION_KEY, index.toString());
    }

    return (
        <div className="container">
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <StepperContainer step={0}>
                <Typography variant={"h1"}>Ticket Shop</Typography>
                <Stack spacing={2}>
                    {
                        events.map((event, index) => {
                            return (
                                <EventSelection label={event.name} name={"event_selection"} index={index} key={index} onChange={handleChange} />
                            )
                        })
                    }
                </Stack>
            </StepperContainer>
        </div>
    );
}

export async function getServerSideProps(context) {
    return {
        props: {
            events: [
                {
                    id: 1,
                    name: "Demo Event 1"
                },
                {
                    id: 2,
                    name: "Demo Event 2"
                }
            ]
        }
    }
}
