import style from "../../../style/SeatMap.module.scss";
import { motion } from "framer-motion";
import { Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../../store/hooks";
import { OrderState, selectOrder } from "../../../store/reducers/orderReducer";
import { SEAT_COLORS } from "../../../constants/Constants";
import { formatPrice } from "../../../constants/util";
import { useTheme } from "@mui/system";
import useTranslation from "next-translate/useTranslation";
import seatselection from "../../../../locale/en/seatselection.json";
import common from "../../../../locale/en/common.json";

export interface Seat {
    type: "seat" | "space";
    id?: number;
    category?: number;
    amount?: number;
    occupied?: boolean;
}

export type OnSeatSelect = (seat: Seat, indexInRow, isSelected: boolean) => unknown;
export type OnContextMenu = (event: React.MouseEvent<HTMLDivElement>, seat: Seat, indexInRow, isSelected: boolean) => unknown;

export const SeatMapSeat = ({
    seat,
    categories,
    onSeatSelect,
    forceNoRedux,
    index,
    onContextMenu
}: {
    seat: Seat;
    categories: Array<{
        id: number;
        label: string;
        price: number;
        currency: string;
        color?: string;
        activeColor?: string;
        occupiedColor?: string;
    }>;
    onSeatSelect?: OnSeatSelect;
    onContextMenu?: OnContextMenu;
    forceNoRedux?: boolean;
    index: number;
}) => {
    const [isSelected, setIsSelected] = useState(false);
    const reduxOrder = (useAppSelector(selectOrder) as OrderState);
    const theme = useTheme();
    const orders = !forceNoRedux
        ? reduxOrder
        : null;
    const { t } = useTranslation();

    useEffect(() => {
        setIsSelected(
            orders?.tickets?.some((val) => val.seatId === seat.id) ?? false
        );
    }, [orders, seat.id]);

    const handleSelect = () => {
        if (seat.occupied) return;
        if (onSeatSelect) onSeatSelect(seat, index, !isSelected);
        setIsSelected((prev) => !prev);
    };

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!onContextMenu) return;
        event.preventDefault();
        onContextMenu(event, seat, index, isSelected);
    };

    const category = categories.find(
        (category) => category.id === seat.category
    );
    if (!category) return null;

    const color = isSelected
        ? category.activeColor ?? SEAT_COLORS.active
        : seat.occupied
        ? category.occupiedColor ?? SEAT_COLORS.occupied
        : category.color ?? SEAT_COLORS.normal;
    return (
        <Tooltip
            title={
                <React.Fragment>
                    {(seat.occupied && !isSelected) ? (
                        <Typography>
                            {t("seatselection:seat-booked", null, {fallback: seatselection["seat-booked"]})}
                        </Typography>
                    ) : (
                        <>
                            <Typography variant={"body1"}>
                                {t("common:category", null, {fallback: common["category"]})}: {category.label}
                            </Typography>
                            <Typography variant={"body1"}>
                                {t("common:price", null, {fallback: common["price"]})}:{" "}
                                {formatPrice(
                                    category.price * seat.amount,
                                    category.currency
                                )}
                            </Typography>
                        </>
                    )}
                </React.Fragment>
            }
            disableInteractive
        >
            <motion.div
                className={`${style.seat} seat-selection-seatmap-seat`}
                style={{
                    height: theme.spacing(5),
                    width:
                        (seat.amount ?? 1) * parseInt(theme.spacing(5).replace("px", "")) + ((seat.amount ?? 1) - 1) * parseInt(theme.spacing(1).replace("px", "")),
                    backgroundColor: color,
                    borderRadius: theme.shape.borderRadius + "px",
                    margin: theme.spacing(0.5)
                }}
                whileHover={{
                    opacity: 0.6,
                    transition: { duration: 0.1, delay: 0 }
                }}
                onClick={handleSelect}
                onContextMenu={handleContextMenu}
            >
                <span>{seat.id}</span>
            </motion.div>
        </Tooltip>
    );
};

export const SeatMapSpace = ({ seat }: { seat: Seat }) => {
    const theme = useTheme();
    return (
        <div
            className={style.seat}
            style={{
                height: theme.spacing(5),
                width: (seat.amount ?? 1) * parseInt(theme.spacing(5).replace("px", "")),
                cursor: "initial",
                margin: theme.spacing(0.5)
            }}
        />
    );
};
