import { Button, Grid, Typography } from "@mui/material";
import { SeatSelectionFreeEntry } from "./SeatSelectionFreeEntry";
import { Box } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect } from "react";
import { useAppSelector } from "../../../store/hooks";
import {
    FreeSeatOrder,
    selectOrder,
    setOrder
} from "../../../store/reducers/orderReducer";
import { useDispatch } from "react-redux";
import { calculateTotalPrice, formatPrice, totalTicketAmount } from "../../../constants/util";
import useTranslation from "next-translate/useTranslation";
import { motion } from "framer-motion";
import seatSelectionText from "../../../../locale/en/seatselection.json";
import commonText from "../../../../locale/en/common.json";

export const SeatSelectionFree = ({ categories }) => {
    const order = useAppSelector(selectOrder) as FreeSeatOrder;
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        if (order.orders && order.orders.length > 0) return;
        const newOrder: FreeSeatOrder = {
            ticketAmount: -1,
            orders: [{ amount: -1, categoryId: -1, price: 0 }],
            totalPrice: 0
        };
        dispatch(setOrder(newOrder));
    }, [dispatch, order.orders]);

    const handleChange = (index, amount: number, categoryId) => {
        if (categoryId === -1) return;
        const price: number =
            amount * categories.find((cat) => cat.id === categoryId).price;
        const newOrder: FreeSeatOrder = {
            ticketAmount: amount,
            orders: order.orders.map((a) => a),
            totalPrice: price
        };
        newOrder.orders[index] = {
            amount: amount,
            categoryId: categoryId,
            price: price
        };
        newOrder.totalPrice = calculateTotalPrice(newOrder, categories);
        newOrder.ticketAmount = totalTicketAmount(newOrder);
        dispatch(setOrder(newOrder));
    };

    const handleAddCategory = () => {
        if (order.orders && order.orders.length >= categories.length) return;
        const newOrder: FreeSeatOrder = {
            ticketAmount: order.ticketAmount,
            orders: order.orders.map((a) => a),
            totalPrice: order.totalPrice
        };
        newOrder.orders.push({ amount: 0, categoryId: -1, price: 0 });
        dispatch(setOrder(newOrder));
    };

    const handleRemoveCategory = (index) => {
        if (order.orders.length < index || order.orders.length <= 1) return;
        const newOrder: FreeSeatOrder = {
            ticketAmount: order.ticketAmount,
            orders: order.orders.map((a) => a),
            totalPrice: order.totalPrice
        };
        newOrder.orders.splice(index, 1);
        newOrder.totalPrice = calculateTotalPrice(newOrder, categories);
        newOrder.ticketAmount = totalTicketAmount(newOrder);
        dispatch(setOrder(newOrder));
    };

    return (
        <Grid
            item
            md={12}
            lg={8}
            alignItems="center"
            justifyContent="center"
            display="flex"
            flexDirection="column"
        >
            <motion.div layout>
                <Typography variant={"body1"} alignSelf={"center"}>
                    {t("seatselection:no-seat-reservation", null, {fallback: ""})}
                </Typography>
            </motion.div>
            <Grid container spacing={2} justifyContent={"center"}>
                {order.orders &&
                    order.orders.length > 0 &&
                    order.orders.map((o, index) => {
                        return (
                            <Grid item sm={12} md={6} key={index}>
                                <SeatSelectionFreeEntry
                                    categories={categories}
                                    onChange={handleChange}
                                    index={index}
                                    currentOrder={order}
                                    onRemove={handleRemoveCategory}
                                />
                            </Grid>
                        );
                    })}
            </Grid>
            <motion.div layout>
                <Box height={20} />
                <Button
                    color="primary"
                    variant="outlined"
                    onClick={handleAddCategory}
                    disabled={
                        order.orders && order.orders.length >= categories.length
                    }
                    id={"seat-selection-free-add-category"}
                >
                    <AddIcon /> {t("seatselection:add-category", null, {fallback: seatSelectionText["add-category"]})}
                </Button>
                <Box height={20} />
                <Typography suppressHydrationWarning>
                    {t("common:total-price", null, {fallback: commonText["total-price"]})}:{" "}
                    <b id={"seat-selection-free-total-price"}>
                        {
                            categories.length > 0 && formatPrice(order.totalPrice, categories[0]?.currency)
                        }
                    </b>
                </Typography>
            </motion.div>
        </Grid>
    );
};