import {Step} from "../components/Step";
import React from "react";


export default function Payment({direction}) {
    return (
        <Step direction={direction} style={{width: "100%", maxHeight: "100%"}}>
            Payment
        </Step>
    );
}
