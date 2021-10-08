import {Box} from "@mui/system";
import {Typography} from "@mui/material";
import styles from "../style/EventSelection.module.scss";
import {Check} from "@mui/icons-material";
import {ChangeEventHandler, useEffect, useState} from "react";
import {EVENT_SELECTION_KEY} from "../constants/Constants";

interface Props {
    label: string;
    name: string;
    index: number;
    onChange?: (index: number) => unknown;
}

export const EventSelection = (props: Props) => {

    const [defaultChecked, setDefaultChecked] = useState<boolean>();

    useEffect(() => {
        const currentState = parseInt(window.localStorage.getItem(EVENT_SELECTION_KEY) ?? "0");
        setDefaultChecked(currentState === props.index);
    }, []);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        if (parseInt(event.target.value) !== props.index || !props.onChange) return;
        props.onChange(props.index);
    };

    return (
        <Box className={styles.eventSelection}>
            <input type="radio" name={props.name} value={props.index} id={`${props.name}${props.index}`} defaultChecked={defaultChecked} onChange={handleChange} />
            <label htmlFor={`${props.name}${props.index}`}>
                <Box><Check /></Box>
                <Typography>{props.label}</Typography>
            </label>
        </Box>
    );
}
