import React, {useEffect} from "react";
import {SeatSelectionFree} from "../components/SeatSelectionFree";
import {Button, Grid, Typography} from "@mui/material";
import {Step} from "../components/Step";
import {useDispatch} from "react-redux";
import {disableNextStep, enableNextStep} from "../store/reducers/nextStepAvailableReducer";
import {FreeSeatOrder, selectOrder, setOrder} from "../store/reducers/orderReducer";
import {useAppSelector} from "../store/hooks";
import AddIcon from '@mui/icons-material/Add';
import {Box} from "@mui/system";
import prisma from "../lib/prisma";
import {selectEventSelected} from "../store/reducers/eventSelectionReducer";

export default function SeatSelection({categories, direction}) {

    const dispatch = useDispatch();
    const order = useAppSelector(selectOrder) as FreeSeatOrder;
    const selectedEvent = useAppSelector(selectEventSelected);

    categories = categories.filter(category => category.events.some(event => event.eventId === selectedEvent));

    useEffect(() => {
        if (order.orders && order.orders.length > 0) return;
        const newOrder: FreeSeatOrder = {
            ticketAmount: -1,
            orders: [{amount: -1, categoryId: -1, price: 0}],
            totalPrice: 0
        }
        dispatch(setOrder(newOrder));
    }, []);

    const handleChange = (index, amount: number, categoryId) => {
        const price: number = amount * categories.find(cat => cat.id === categoryId).price;
        const newOrder: FreeSeatOrder = {ticketAmount: amount, orders: order.orders.map(a => a), totalPrice: price};
        newOrder.orders[index] = {amount: amount, categoryId: categoryId, price: price};
        newOrder.totalPrice = newOrder.orders.reduce((total, order) => total + order.price, 0);
        newOrder.ticketAmount = newOrder.orders.reduce((total, order) => total + order.amount, 0);
        dispatch(setOrder(newOrder));
        if (newOrder.orders.every(value => value.amount > 0 && value.categoryId >= 0)) {
            dispatch(enableNextStep());
            return;
        }
        dispatch(disableNextStep());
    }

    const handleAddCategory = () => {
        if (order.orders && order.orders.length >= categories.length) return;
        const newOrder: FreeSeatOrder = {ticketAmount: order.ticketAmount, orders: order.orders.map(a => a), totalPrice: order.totalPrice};
        newOrder.orders.push({amount: 0, categoryId: -1, price: 0});
        dispatch(setOrder(newOrder));
    };

    const handleRemoveCategory = (index) => {
        if (order.orders.length < index || order.orders.length <= 1) return;
        const newOrder: FreeSeatOrder = {ticketAmount: order.ticketAmount, orders: order.orders.map(a => a), totalPrice: order.totalPrice};
        newOrder.orders.splice(index, 1);
        dispatch(setOrder(newOrder));
    };

    return (
        <Step direction={direction} style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%"}}>
            <Grid container alignItems="center" justifyContent="center">
                <Grid item md={12} lg={8} alignItems="center" justifyContent="center" display="flex" flexDirection="column">
                    <Typography variant={"body1"} alignSelf={"center"}>This event has no seat reservation</Typography>
                    <Grid container spacing={2} justifyContent={"center"}>
                        {
                            order.orders && order.orders.length > 0 && (
                                order.orders.map((o, index) => {
                                    return (
                                        <Grid item sm={12} md={6} key={index}>
                                            <SeatSelectionFree categories={categories} onChange={handleChange} index={index} currentOrder={order} onRemove={handleRemoveCategory} />
                                        </Grid>
                                    )
                                })
                            )
                        }
                    </Grid>
                    <Box height={20} />
                    <Button color="primary" variant="outlined" onClick={handleAddCategory} disabled={order.orders && order.orders.length >= categories.length}><AddIcon /> Add Category</Button>
                    <Box height={20} />
                    <Typography>Total Price: <b>{order.totalPrice.toFixed(2)}&euro;</b></Typography>
                </Grid>
            </Grid>
        </Step>
    );
}

export async function getServerSideProps(context) {
    const categories = await prisma.category.findMany({
        include: {
            events: true
        }
    });

    return {
        props: {
            categories: categories
        }
    }
}
