import {Box, Button, Paper, Step, StepLabel, Stepper} from "@mui/material";
import React, {useEffect, useRef, useState} from "react";
import {STEP_URLS, STEPS} from "../constants/Constants";
import {useRouter} from "next/router";
import Head from "next/head";
import {selectNextStateAvailable} from "../store/reducers/nextStepAvailableReducer";
import {useAppSelector} from "../store/hooks";
import style from "../style/StepperContainer.module.scss";

interface Props {
    onNext?: () => unknown;
    onBack?: () => unknown;
    children?: React.ReactNode;
}

export const StepperContainer = (props: Props) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const nextDisabled = useAppSelector(selectNextStateAvailable);
    const bottomBar = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bottomBar.current || !content.current) return;
        content.current.style.paddingBottom = `${bottomBar.current.clientHeight}px`;
    }, [bottomBar, content]);

    useEffect(() => {
        setCurrentStep(STEP_URLS.findIndex(val => val === router.pathname));
    }, [router]);

    const handleNext = async () => {
        if (currentStep + 1 >= STEP_URLS.length) return;
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
        <Box sx={{ width: '90%', margin: "auto", padding: "10px", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
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
                <Box className={style.content} ref={content}>
                    {props.children}
                </Box>
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={20} ref={bottomBar}>
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
                        <Button onClick={handleNext} disabled={!nextDisabled}>
                            Next
                        </Button>
                    </Box>
                </Paper>
            </React.Fragment>
        </Box>
    )
};
