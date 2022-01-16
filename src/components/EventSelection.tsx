import { Box } from "@mui/system";
import { Typography } from "@mui/material";
import styles from "../style/EventSelection.module.scss";
import { Check } from "@mui/icons-material";
import { ChangeEventHandler } from "react";
import { useAppSelector } from "../store/hooks";
import { selectEventSelected } from "../store/reducers/eventSelectionReducer";

interface Props {
    label: string;
    name: string;
    index: number;
    onChange?: (index: number) => unknown;
}

export const EventSelection = (props: Props) => {
    const currentSelectedEvent = useAppSelector(selectEventSelected);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        if (parseInt(event.target.value) !== props.index || !props.onChange)
            return;
        props.onChange(props.index);
    };

    return (
        <Box className={styles.eventSelection}>
            <input
                type="radio"
                name={props.name}
                value={props.index}
                id={`${props.name}${props.index}`}
                defaultChecked={currentSelectedEvent === props.index}
                onChange={handleChange}
            />
            <label htmlFor={`${props.name}${props.index}`}>
                <Box>
                    <Check />
                </Box>
                <Typography>{props.label}</Typography>
            </label>
        </Box>
    );
};
