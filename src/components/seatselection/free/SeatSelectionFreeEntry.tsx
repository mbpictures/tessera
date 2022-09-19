import {
    Button,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import { useState } from "react";
import { Box } from "@mui/system";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { motion } from "framer-motion";
import { Delete } from "@mui/icons-material";
import { formatPrice } from "../../../constants/util";
import useTranslation from "next-translate/useTranslation";
import seatSelectionText from "../../../../locale/en/seatselection.json";
import commonText from "../../../../locale/en/common.json";
import { Tickets } from "../../../store/reducers/orderReducer";

export const SeatSelectionFreeEntry = ({
    onChange,
    categories,
    index,
    currentlySelectedCategories,
    tickets,
    onRemove,
    category
}: {
    onChange?: (index: number, amount: number, categoryId, oldCategory) => unknown;
    categories: Array<{
        id: number;
        label: string;
        price: number;
        currency: string;
        ticketsLeft: number;
    }>;
    index: number;
    currentlySelectedCategories: Array<number>;
    tickets: Tickets;
    onRemove?: (index: number, categoryId: number) => unknown;
    category?: number;
}) => {
    const alreadyUsedCategories = currentlySelectedCategories.filter((_, i) => i !== index);
    const categoriesFiltered = categories.filter(category => !alreadyUsedCategories.includes(category.id));

    const [ticketAmount, setTicketAmount] = useState<number>(tickets.filter(ticket => ticket.categoryId === category).length);
    const { t } = useTranslation();

    const getTicketsLeft = (categoryId?: number) => {
        return categories.find((value) => value.id === (categoryId ?? category))?.ticketsLeft ?? Infinity;
    }

    const handleChange = (event) => {
        if (event.target.value === "") {
            setTicketAmount(-1);
            return;
        }
        const newValue = Math.min(isNaN(parseInt(event.target.value)) ? 0 : parseInt(event.target.value), getTicketsLeft());
        setTicketAmount(newValue);
        onChange(index, newValue, category, category);
    };

    const onAdd = () => {
        const val = Math.min(ticketAmount + 1, getTicketsLeft());
        setTicketAmount(val);
        onChange(index, val, category, category);
    };

    const onSubtract = () => {
        if (ticketAmount <= 0) return;
        setTicketAmount(ticketAmount - 1);
        onChange(index, ticketAmount - 1, category, category);
    };

    const handleCategoryChange = (event) => {
        onChange(index, Math.min(ticketAmount, getTicketsLeft(parseInt(event.target.value))), parseInt(event.target.value), category);
    };

    const price =
        ticketAmount * categories.find((value) => value.id === category)?.price ?? 0;

    return (
        <motion.div layout>
            <Paper
                elevation={5}
                style={{
                    display: "flex",
                    padding: "20px",
                    flexDirection: "column",
                    margin: "20px 0"
                }}
            >
                <Box
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <TextField
                        id="outlined-basic"
                        label={t("common:amount", null, {fallback: commonText["amount"]})}
                        variant="outlined"
                        value={ticketAmount === -1 ? "" : ticketAmount}
                        onChange={handleChange}
                        className={"seat-selection-free-ticket-amount"}
                    />
                    <Box width={20} />
                    <Stack>
                        <IconButton
                            onClick={onAdd}
                            color={"primary"}
                            className={"seat-selection-free-add"}
                        >
                            <AddCircleIcon fontSize={"large"} />
                        </IconButton>
                        <IconButton
                            color="error"
                            onClick={onSubtract}
                            className={"seat-selection-free-remove"}
                        >
                            <RemoveCircleIcon fontSize={"large"} />
                        </IconButton>
                    </Stack>
                </Box>
                <InputLabel id={"category-selection" + index}>{t("common:category", null, {fallback: commonText["category"]})}</InputLabel>
                <Select
                    value={category === -1 ? "" : category}
                    onChange={handleCategoryChange}
                    id={"category-selection" + index}
                    className={"category-selection"}
                >
                    {categoriesFiltered.map((category) => (
                        <MenuItem
                            value={category.id}
                            key={category.id}
                            id={"category-selection-entry" + index + "-" + category.id}
                        >
                            {category.label} (
                            {formatPrice(category.price, category.currency)})
                        </MenuItem>
                    ))}
                </Select>
                <motion.div
                    layout
                    style={{ padding: "10px 0", alignSelf: "center" }}
                >
                    {price > 0 && (
                        <Typography variant={"body1"}>
                            {t("common:price", null, {fallback: commonText["price"]})}:{" "}
                            <b>{formatPrice(price, categories[0].currency)}</b>
                        </Typography>
                    )}
                </motion.div>
                {
                    index > 0 && (
                        <Button
                            startIcon={<Delete />}
                            color={"error"}
                            onClick={() => onRemove(index, category)}
                            variant="outlined"
                            style={{ alignSelf: "center" }}
                            className={'seat-selection-free-remove-category'}
                        >
                            {t("seatselection:remove-category", null, {fallback: seatSelectionText["remove-category"]})}
                        </Button>
                    )
                }
            </Paper>
        </motion.div>
    );
};
