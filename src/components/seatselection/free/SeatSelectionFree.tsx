import { Button, Grid, Typography } from "@mui/material";
import { SeatSelectionFreeEntry } from "./SeatSelectionFreeEntry";
import { Box } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import React, { useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import {
    OrderState,
    selectOrder, setTickets, Tickets
} from "../../../store/reducers/orderReducer";
import { useDispatch } from "react-redux";
import { formatPrice } from "../../../constants/util";
import useTranslation from "next-translate/useTranslation";
import { motion } from "framer-motion";
import seatSelectionText from "../../../../locale/en/seatselection.json";
import commonText from "../../../../locale/en/common.json";

export const SeatSelectionFree = ({ categories }) => {
    const order = useAppSelector(selectOrder) as OrderState;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [currentlySelectedCategories, setCurrentlySelectedCategories] = useState([1]);

    const handleChange = (index, amount: number, categoryId, oldCategory) => {
        if (categoryId === -1) return;
        const newTickets: Tickets = order.tickets.map(a => a).filter(a => a.categoryId !== oldCategory);
        newTickets.push(...Array.from(Array(amount).keys()).map(() => ({categoryId: categoryId, amount: 1})));
        dispatch(setTickets(newTickets));
        const newValue = currentlySelectedCategories.map(a => a);
        newValue[index] = categoryId;
        setCurrentlySelectedCategories(newValue);
    };

    const handleAddCategory = () => {
        if (currentlySelectedCategories.length >= categories.length) return;
        setCurrentlySelectedCategories([...currentlySelectedCategories, -1]);
    };

    const handleRemoveCategory = (index) => {
        if (currentlySelectedCategories.length < index || currentlySelectedCategories.length <= 1) return;
        const categoryId = currentlySelectedCategories[index];
        const newValue = currentlySelectedCategories.map(a => a);
        newValue.splice(index, 1);
        setCurrentlySelectedCategories(newValue);
        dispatch(setTickets(order.tickets.map(a => a).filter(a => a.categoryId !== categoryId)))
    };

    const price = order.tickets.reduce((a, ticket) => a + categories.find(category => category.id === ticket.categoryId).price, 0);
    categories = categories.filter(category => category.ticketsLeft != null ? category.ticketsLeft > 0 : true);

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
            {
                categories.length > 0 ? (
                    <>
                        <motion.div layout>
                            <Typography variant={"body1"} alignSelf={"center"}>
                                {t("seatselection:no-seat-reservation", null, {fallback: ""})}
                            </Typography>
                        </motion.div>
                        <Grid container spacing={2} justifyContent={"center"}>
                            {currentlySelectedCategories &&
                                currentlySelectedCategories.length > 0 &&
                                currentlySelectedCategories.map((o, index) => {
                                    return (
                                        <Grid item sm={12} md={6} key={index}>
                                            <SeatSelectionFreeEntry
                                                categories={categories}
                                                onChange={handleChange}
                                                index={index}
                                                onRemove={handleRemoveCategory}
                                                tickets={order.tickets}
                                                currentlySelectedCategories={currentlySelectedCategories}
                                                category={o}
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
                                    currentlySelectedCategories && currentlySelectedCategories.length >= categories.length
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
                                        categories.length > 0 && formatPrice(price, categories[0]?.currency)
                                    }
                                </b>
                            </Typography>
                        </motion.div>
                    </>
                ) : (
                    <Typography variant={"h2"} textAlign={"center"}>
                        {t("seatselection:event-booked-out")}
                    </Typography>
                )
            }

        </Grid>
    );
};
