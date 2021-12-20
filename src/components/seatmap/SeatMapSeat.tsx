import style from "./../../style/SeatMap.module.scss";
import {motion} from "framer-motion";
import {Tooltip, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {SeatOrder, selectOrder, setOrder} from "../../store/reducers/orderReducer";

export interface Seat {
    type: "seat" | "space";
    id?: number;
    category?: number;
    amount?: number;
}

export type OnSeatSelect = (seat: Seat, isSelected: boolean) => unknown;

export const SeatMapSeat = ({seat, categories, onSeatSelect}: {seat: Seat, categories: Array<{id: number, label: string, price: number}>, onSeatSelect?: OnSeatSelect}) => {
    const [isSelected, setIsSelected] = useState(false);
    const order = useAppSelector(selectOrder) as SeatOrder;
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (order.seats) return;
        const newOrder: SeatOrder = {
            ticketAmount: -1,
            totalPrice: -1,
            seats: []
        }
        dispatch(setOrder(newOrder));
    }, []);

    const createNewOrder = () => {
        return {ticketAmount: 0, seats: order.seats.map(a => a), totalPrice: 0};
    };

    const getPrice = (order: SeatOrder) => {
        return order.seats
            .map(seat => {
                return {amount: seat.amount, price: categories.find(cat => cat.id === seat.category).price}
            })
            .reduce((a, seat) => a + seat.price, 0);
    };

    const addSeat = () => {
        const newOrder: SeatOrder = createNewOrder();
        newOrder.seats.push(seat);
        newOrder.totalPrice = getPrice(newOrder);
        newOrder.ticketAmount = newOrder.seats.length;
        dispatch(setOrder(newOrder));
    };

    const removeSeat = () => {
        const newOrder: SeatOrder = createNewOrder();
        newOrder.seats.splice(newOrder.seats.findIndex(s => s.id === seat.id), 1);
        newOrder.totalPrice = getPrice(newOrder);
        newOrder.ticketAmount = newOrder.seats.length;
        dispatch(setOrder(newOrder));
    };

    const handleSelect = () => {
        if (onSeatSelect)
            onSeatSelect(seat, !isSelected);
        if (isSelected)
            removeSeat();
        else
            addSeat();
        setIsSelected(prev => !prev);
    };

    const category = categories.find(category => category.id === seat.category);
    if (!category) return null;
    return (
        <Tooltip
            title={
                <React.Fragment>
                    <Typography variant={"body1"}>Category: {category.label}</Typography>
                    <Typography variant={"body1"}>Price: {(category.price * seat.amount).toFixed(2)}€</Typography>
                </React.Fragment>
            }
        >
            <motion.div
                className={style.seat}
                style={{height: 40, width: (seat.amount ?? 1) * 40, backgroundColor: !isSelected ? "#59bb59" : "#5959bb"}}
                whileHover={{
                    opacity: 0.6,
                    transition: { duration: 0.2, delay: 0 }
                }}
                onClick={handleSelect}
            >
                <span>{seat.id}</span>
            </motion.div>
        </Tooltip>
    );
};

export const SeatMapSpace = ({seat}: {seat: Seat}) => {
    return (
        <div className={style.seat} style={{height: 40, width: (seat.amount ?? 1) * 40, cursor: "initial"}} />
    );
}
