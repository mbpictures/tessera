import {Box, Button, Paper, Step, StepLabel, Stepper} from "@mui/material";
import React, {useEffect, useState} from "react";
import {STEP_URLS, STEPS} from "../constants/Constants";
import {useRouter} from "next/router";
import Head from "next/head";

interface Props {
    onNext?: () => unknown;
    onBack?: () => unknown;
    children?: React.ReactNode;
}

export const StepperContainer = (props: Props) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);

    useEffect(() => {
        setCurrentStep(STEP_URLS.findIndex(val => val === router.pathname));
    }, [router]);

    const handleNext = async () => {
        if (currentStep >= STEPS.length) return;
        if (props.onNext)
            props.onNext();
        await router.push(STEP_URLS[currentStep + 1]);
    }

    const handleBack = async () => {
        if (currentStep <= 0) return;
        if (props.onBack)
            props.onBack();
        await router.push(STEP_URLS[currentStep - 1]);
    }

    return (
        <Box sx={{ width: '90%', margin: "auto", padding: "10px" }}>
            <Head>
                <title>Ticket Shop - {STEPS[currentStep]}</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Stepper activeStep={currentStep}>
                {STEPS.map((label) => {
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
                {props.children}
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={20}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, padding: "5px 0" }}>
                        {
                            currentStep > 0 && (
                                <Button
                                    color="inherit"
                                    sx={{ mr: 1 }}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                            )
                        }

                        <Box sx={{ flex: '1 1 auto' }} />
                        <Button onClick={handleNext}>
                            Next
                        </Button>
                    </Box>
                </Paper>
            </React.Fragment>
        </Box>
    )
};
