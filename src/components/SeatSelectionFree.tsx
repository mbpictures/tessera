import {IconButton, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {Box} from "@mui/system";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {FreeSeatOrder} from "../store/reducers/orderReducer";
import {motion} from "framer-motion";

export const SeatSelectionFree = (
    {
        onChange,
        categories,
        index,
        currentOrder
    }: {
        onChange?: (index: number, amount: number, categoryId) => unknown,
        categories: Array<{ id: number, name: string, price: number }>,
        index: number,
        currentOrder: FreeSeatOrder
    }) => {
    const [ticketAmount, setTicketAmount] = useState<number>(0);
    const [category, setCategory] = useState<number>(categories[0].id);

    useEffect(() => {
        if (!currentOrder.orders || currentOrder.orders.length <= index) return;
        if (currentOrder.orders[index].amount > 0)
            setTicketAmount(currentOrder.orders[index].amount);
        if (currentOrder.orders[index].categoryId != -1)
            setCategory(currentOrder.orders[index].categoryId);
    }, []);

    useEffect(() => {
        if (!onChange) return;
        onChange(index, ticketAmount, category);
    }, [ticketAmount, category]);

    const handleChange = (event) => {
        if (event.target.value === "") {
            setTicketAmount(-1);
            return;
        }
        const newValue = parseInt(event.target.value);
        setTicketAmount(isNaN(newValue) ? 0 : newValue);
    };

    const onAdd = () => {
        setTicketAmount(ticketAmount + 1);
    };

    const onSubtract = () => {
        if (ticketAmount <= 0) return;
        setTicketAmount(ticketAmount - 1);
    };

    const handleCategoryChange = (event) => {
        setCategory(parseInt(event.target.value));
    }

    const price = ticketAmount * categories.find(value => value.id === category).price;

    return (
        <motion.div layout>
            <Paper elevation={5} style={{display: "flex", padding: "20px", flexDirection: "column", margin: "20px 0"}}>
                <Box style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <TextField id="outlined-basic" label="Amount" variant="outlined" value={ticketAmount === -1 ? "" : ticketAmount} onChange={handleChange} />
                    <Box width={20} />
                    <Stack>
                        <IconButton onClick={onAdd} color={"primary"}><AddCircleIcon fontSize={"large"} /></IconButton>
                        <IconButton color="error" onClick={onSubtract}><RemoveCircleIcon fontSize={"large"} /></IconButton>
                    </Stack>
                </Box>
                <InputLabel id="category-selection">Category</InputLabel>
                <Select value={category} onChange={handleCategoryChange} id="category-selection">
                    {categories.map(category => <MenuItem value={category.id} key={category.id}>{category.name} ({category.price}&euro;)</MenuItem>)}
                </Select>
                <motion.div layout style={{padding: "10px 0", alignSelf: "center"}}>
                    {
                        price > 0 && (
                            <Typography variant={"body1"}>Price: <b>{price.toFixed(2)}&euro;</b></Typography>
                        )
                    }
                </motion.div>
            </Paper>
        </motion.div>
    );
}
