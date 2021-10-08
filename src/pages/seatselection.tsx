import Head from "next/head";
import {StepperContainer} from "../components/StepperContainer";
import React from "react";

export default function SeatSelection() {

    return (
        <div className="container">
            <Head>
                <title>Create Next App</title>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <StepperContainer step={1}>
                Seat Selection
            </StepperContainer>
        </div>
    );
}
