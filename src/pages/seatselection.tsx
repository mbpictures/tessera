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

export default function SeatSelection({categories, direction}) {

    const dispatch = useDispatch();
    const order = useAppSelector(selectOrder) as FreeSeatOrder;

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
        dispatch(setOrder(newOrder));
        if (amount > 0) {
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

    return (
        <Step direction={direction} style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "100%"}}>
            <Typography variant={"body1"} alignSelf={"center"}>This event has no seat reservation</Typography>
            <Grid container rowSpacing={2} columnSpacing={2} justifyContent={"center"}>
                {
                    order.orders && order.orders.length > 0 && (
                        order.orders.map((o, index) => {
                            return (
                                <Grid item xs={6} key={index}>
                                    <SeatSelectionFree categories={categories} onChange={handleChange} index={index} currentOrder={order} />
                                </Grid>
                            )
                        })
                    )
                }
            </Grid>
            <Box height={20} />
            <Button color="primary" variant="outlined" onClick={handleAddCategory} disabled={order.orders && order.orders.length >= categories.length}><AddIcon /> Add Category</Button>
        </Step>
    );
}

export async function getServerSideProps(context) {
    return {
        props: {
            categories: [
                {
                    id: 1,
                    name: "Premium",
                    price: 60.99
                },
                {
                    id: 2,
                    name: "Economy",
                    price: 30.99
                }
            ]
        }
    }
}
