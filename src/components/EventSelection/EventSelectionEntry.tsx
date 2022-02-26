import { Box } from "@mui/system";
import { Theme, Typography } from "@mui/material";
import styles from "../../style/EventSelection.module.scss";
import { Check } from "@mui/icons-material";
import { ChangeEventHandler } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectEventSelected } from "../../store/reducers/eventSelectionReducer";
import { makeStyles } from "@mui/styles";

interface Props {
    label: string;
    name: string;
    index: number;
    onChange?: (index: number) => unknown;
}

const useStyles = makeStyles((theme: Theme) => ({
    input: {
        "&:checked ~ label > div": {
            backgroundColor: theme.palette.primary.main
        },
        "&:checked ~ label > p": {
            backgroundColor: theme.palette.action.disabled
        }
    },
    box: {
        backgroundColor: theme.palette.primary.light,
        borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
        padding: theme.spacing(1)
    },
    p: {
        backgroundColor: theme.palette.action.selected,
        borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
        padding: `${theme.spacing(1)} 0 ${theme.spacing(1)} ${theme.spacing(1)}`,
        "&:hover": {
            backgroundColor: theme.palette.action.hover
        }
    }
}));

export const EventSelectionEntry = (props: Props) => {
    const currentSelectedEvent = useAppSelector(selectEventSelected);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
        if (parseInt(event.target.value) !== props.index || !props.onChange)
            return;
        props.onChange(props.index);
    };

    const classes = useStyles();

    return (
        <Box className={styles.eventSelection}>
            <input
                type="radio"
                name={props.name}
                value={props.index}
                id={`${props.name}${props.index}`}
                defaultChecked={currentSelectedEvent === props.index}
                onChange={handleChange}
                className={classes.input}
            />
            <label htmlFor={`${props.name}${props.index}`}>
                <Box className={classes.box}>
                    <Check />
                </Box>
                <Typography className={classes.p}>{props.label}</Typography>
            </label>
        </Box>
    );
};
