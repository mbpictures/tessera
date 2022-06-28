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
import { FreeSeatOrder } from "../../../store/reducers/orderReducer";
import { motion } from "framer-motion";
import { Delete } from "@mui/icons-material";
import { formatPrice } from "../../../constants/util";
import useTranslation from "next-translate/useTranslation";

export const SeatSelectionFreeEntry = ({
    onChange,
    categories,
    index,
    currentOrder,
    onRemove
}: {
    onChange?: (index: number, amount: number, categoryId) => unknown;
    categories: Array<{
        id: number;
        label: string;
        price: number;
        currency: string;
    }>;
    index: number;
    currentOrder: FreeSeatOrder;
    onRemove?: (index: number) => unknown;
}) => {
    const alreadyUsedCategories = currentOrder.orders.filter((_, i) => i !== index).map(order => order.categoryId);
    const categoriesFiltered = categories.filter(category => !alreadyUsedCategories.includes(category.id));

    const order = !currentOrder?.orders || currentOrder.orders.length <= index ? null : currentOrder.orders[index]
    const [ticketAmount, setTicketAmount] = useState<number>((order?.categoryId ?? -1) > 0 ? order.categoryId : 0);
    const [category, setCategory] = useState<number>((order?.categoryId ?? -1) !== -1  ? order.categoryId : -1);
    const { t } = useTranslation();

    const handleChange = (event) => {
        if (event.target.value === "") {
            setTicketAmount(-1);
            return;
        }
        const newValue = parseInt(event.target.value);
        setTicketAmount(isNaN(newValue) ? 0 : newValue);
        onChange(index, isNaN(newValue) ? 0 : newValue, category);
    };

    const onAdd = () => {
        setTicketAmount(ticketAmount + 1);
        onChange(index, ticketAmount + 1, category);
    };

    const onSubtract = () => {
        if (ticketAmount <= 0) return;
        setTicketAmount(ticketAmount - 1);
        onChange(index, ticketAmount - 1, category);
    };

    const handleCategoryChange = (event) => {
        setCategory(parseInt(event.target.value));
        onChange(index, ticketAmount, parseInt(event.target.value));
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
                        label={t("common:amount")}
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
                <InputLabel id={"category-selection" + index}>{t("common:category")}</InputLabel>
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
                            {t("common:price")}:{" "}
                            <b>{formatPrice(price, categories[0].currency)}</b>
                        </Typography>
                    )}
                </motion.div>
                {
                    index > 0 && (
                        <Button
                            startIcon={<Delete />}
                            color={"error"}
                            onClick={() => onRemove(index)}
                            variant="outlined"
                            style={{ alignSelf: "center" }}
                            className={'seat-selection-free-remove-category'}
                        >
                            {t("seatselection:remove-category")}
                        </Button>
                    )
                }
            </Paper>
        </motion.div>
    );
};
