import Head from 'next/head';
import {Box, Button, Paper, Stack, Step, StepLabel, Stepper, Typography} from "@mui/material";
import React from 'react';
import {EventSelection} from "../components/EventSelection";
import {EVENT_SELECTION_KEY} from "../constants/Constants";

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

            <Box sx={{ width: '90%', margin: "auto", padding: "10px" }}>
                <Stepper activeStep={0}>
                    {["Select Event", "Choose seat", "Checkout Order"].map((label) => {
                        const stepProps = {};
                        const labelProps = {};
                        return (
                            <Step key={label} {...stepProps}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <React.Fragment>
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
                    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={20}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, padding: "5px 0" }}>
                            <Button
                                color="inherit"
                                sx={{ mr: 1 }}
                            >
                                Back
                            </Button>
                            <Box sx={{ flex: '1 1 auto' }} />
                            <Button>
                                Next
                            </Button>
                        </Box>
                    </Paper>
                </React.Fragment>
            </Box>
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
