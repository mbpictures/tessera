import { Box, Button, Link, Paper, Step, StepLabel, Stepper } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { STEP_URLS, STEPS } from "../constants/Constants";
import { useRouter } from "next/router";
import Head from "next/head";
import { selectNextStateAvailable } from "../store/reducers/nextStepAvailableReducer";
import { useAppSelector } from "../store/hooks";
import style from "../style/StepperContainer.module.scss";
import { selectEventSelected } from "../store/reducers/eventSelectionReducer";
import useTranslation from "next-translate/useTranslation";
import { LanguageSelection } from "./LanguageSelection";
import { ReservationCountdown } from "./ReservationCountdown";

interface Props {
    onNext?: () => unknown;
    onBack?: () => unknown;
    disableOverflow?: boolean;
    noNext?: boolean;
    children?: React.ReactNode;
    withReservationCountdown?: boolean;
    impressUrl?: string;
}

const decodeHtml = (str) => {
    return str.replace("&shy;", "").replace(/&(\w+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
}

export const StepperContainer = (props: Props) => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<number>(0);
    const nextDisabled = useAppSelector(selectNextStateAvailable);
    const selectedEvent = useAppSelector(selectEventSelected);
    const bottomBar = useRef<HTMLDivElement>(null);
    const topBar = useRef<HTMLDivElement>(null);
    const container = useRef<HTMLDivElement>(null);
    const { t } = useTranslation("common");

    const updateContainerPaddings = () => {
        container.current.style.paddingBottom = `${bottomBar.current.clientHeight}px`;
        container.current.style.paddingTop = `${topBar.current.clientHeight}px`;
    };

    useEffect(() => {
        if (!bottomBar.current || !container.current || !topBar.current) return;
        updateContainerPaddings();
        document.addEventListener("resize", updateContainerPaddings);

        return () => document.removeEventListener("resize", updateContainerPaddings);
    }, [bottomBar, container, topBar]);

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
                width: "100%",
                margin: "auto",
                padding: "10px 0",
                height: "100%",
                overflowX: "hidden"
            }}
            ref={container}
        >
            <Head>
                <title>Ticket Shop - {decodeHtml(t(STEPS[currentStep]))}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Stepper activeStep={currentStep} alternativeLabel style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                padding: "5px 0",
                overflow: "hidden"
            }} ref={topBar}>
                {STEPS.map((label) => {
                    const stepProps = {};
                    const labelProps = {};
                    return (
                        <Step key={label} {...stepProps} className={style.stepperStep}>
                            <StepLabel {...labelProps}><span dangerouslySetInnerHTML={{__html: t(label)}} /></StepLabel>
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
                <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
                    {
                        props.withReservationCountdown && <ReservationCountdown />
                    }
                    <Paper
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
                            <Button
                                color="inherit"
                                sx={{ mr: 1 }}
                                onClick={handleBack}
                                id={"stepper-back-button"}
                                style={{
                                    opacity: currentStep > 0 ? 1 : 0
                                }}
                            >
                                {t("back")}
                            </Button>

                            <Box sx={{ flex: "1 1 auto", display: "flex", alignItems: "center", flexDirection: "column" }}>
                                <LanguageSelection />
                                {
                                    props.impressUrl !== "" && (
                                        <Link href={props.impressUrl} target={"_blank"}>
                                            {t("impress")}
                                        </Link>
                                    )
                                }
                            </Box>

                            <Button
                                onClick={handleNext}
                                disabled={!nextDisabled}
                                id={"stepper-next-button"}
                                style={{
                                    opacity: !props.noNext ? 1 : 0
                                }}
                            >
                                {t("next")}
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            </React.Fragment>
        </Box>
    );
};
