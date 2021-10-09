import {IconButton, Paper, Stack, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {Box} from "@mui/system";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {useAppSelector} from "../store/hooks";
import {selectOrder} from "../store/reducers/orderReducer";

export const SeatSelectionFree = ({onChange}: {onChange?: (amount: number) => unknown}) => {
    const [value, setValue] = useState<number>(0);
    const currentOrder = useAppSelector(selectOrder);

    useEffect(() => {
        if (currentOrder.ticketAmount <= 0) return;
        setValue(currentOrder.ticketAmount);
    }, []);

    useEffect(() => {
        if (!onChange) return;
        onChange(value);
    }, [value, onChange]);

    const handleChange = (event) => {
        if (event.target.value === "") {
            setValue(-1);
            return;
        }
        const newValue = parseInt(event.target.value);
        setValue(isNaN(newValue) ? 0 : newValue);
    };

    const onAdd = () => {
        setValue(value + 1);
    };

    const onSubtract = () => {
        if (value <= 0) return;
        setValue(value - 1);
    };

    return (
        <Paper elevation={5} style={{display: "flex", minWidth: "50%", padding: "20px", alignItems: "center", justifyContent: "center"}}>
            <TextField id="outlined-basic" label="Amount" variant="outlined" value={value === -1 ? "" : value} onChange={handleChange} />
            <Box width={20} />
            <Stack>
                <IconButton onClick={onAdd} color={"primary"}><AddCircleIcon fontSize={"large"} /></IconButton>
                <IconButton color="error" onClick={onSubtract}><RemoveCircleIcon fontSize={"large"} /></IconButton>
            </Stack>
        </Paper>
    );
}
