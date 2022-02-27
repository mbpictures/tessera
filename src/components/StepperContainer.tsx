import { Box, Button, Paper, Step, StepLabel, Stepper } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { STEP_URLS, STEPS } from "../constants/Constants";
import { useRouter } from "next/router";
import Head from "next/head";
import { selectNextStateAvailable } from "../store/reducers/nextStepAvailableReducer";
import { useAppSelector } from "../store/hooks";
import style from "../style/StepperContainer.module.scss";
import { selectEventSelected } from "../store/reducers/eventSelectionReducer";
import useTranslation from "next-translate/useTranslation";

interface Props {
    onNext?: () => unknown;
    onBack?: () => unknown;
    disableOverflow?: boolean;
    noNext?: boolean;
    children?: React.ReactNode;
}

export const StepperContainer = (props: Props) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const nextDisabled = useAppSelector(selectNextStateAvailable);
    const selectedEvent = useAppSelector(selectEventSelected);
    const bottomBar = useRef<HTMLDivElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const { t } = useTranslation("common");

    useEffect(() => {
        if (!bottomBar.current || !container.current) return;
        container.current.style.paddingBottom = `${bottomBar.current.clientHeight}px`;
    }, [bottomBar, container]);

    useEffect(() => {
        setCurrentStep(STEP_URLS.findIndex((val) => val.startsWith(router.pathname)));
    }, [router]);

    const handleNext = async () => {
        if (currentStep + 1 >= STEP_URLS.length) return;
        if (props.onNext) props.onNext();
        const url = STEP_URLS[currentStep + 1].replace("[id]", selectedEvent.toString());
        await router.push(
            `${url}?event=${selectedEvent}`
        );
    };

    const handleBack = async () => {
        if (currentStep <= 0) return;
        if (props.onBack) props.onBack();
        const url = STEP_URLS[currentStep - 1].replace("[id]", selectedEvent.toString());
        const query = currentStep - 1 === 0 ? "" : `?event=${selectedEvent}`;
        await router.push(`${url}${query}`);
    };

    return (
        <Box
            sx={{
                width: "90%",
                margin: "auto",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden"
            }}
            ref={container}
        >
            <Head>
                <title>Ticket Shop - {t(STEPS[currentStep])}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Stepper activeStep={currentStep} alternativeLabel>
                {STEPS.map((label) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps} className={style.stepperStep}>
                            <StepLabel {...labelProps}>{t(label)}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            <React.Fragment>
                <Box
                    className={style.content}
                    ref={container}
                    style={{
                        overflowY: props.disableOverflow ? "hidden" : "auto"
                    }}
                >
                    {props.children}
                </Box>
                <Paper
                    sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
                    elevation={20}
                    ref={bottomBar}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            pt: 2,
                            padding: "5px 0"
                        }}
                    >
                        {currentStep > 0 && (
                            <Button
                                color="inherit"
                                sx={{ mr: 1 }}
                                onClick={handleBack}
                                id={"stepper-back-button"}
                            >
                                {t("back")}
                            </Button>
                        )}

                        <Box sx={{ flex: "1 1 auto" }} />
                        {!props.noNext && (
                            <Button
                                onClick={handleNext}
                                disabled={!nextDisabled}
                                id={"stepper-next-button"}
                            >
                                {t("next")}
                            </Button>
                        )}
                    </Box>
                </Paper>
            </React.Fragment>
        </Box>
    );
};
