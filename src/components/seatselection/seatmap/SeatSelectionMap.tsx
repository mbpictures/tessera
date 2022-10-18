import { SeatRow, SeatSelectionRow } from "./SeatSelectionRow";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Card, Grid } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
    OrderState,
    selectOrder, setTickets
} from "../../../store/reducers/orderReducer";
import { useEffect, useRef, useState } from "react";
import { Seat } from "./SeatMapSeat";
import { PaymentOverview } from "../../PaymentOverview";

export type SeatMap = Array<SeatRow>;

export const SeatSelectionMap = ({
    seatSelectionDefinition,
    categories,
    hideSummary
}: {
    seatSelectionDefinition: SeatMap;
    categories: Array<{
        id: number;
        label: string;
        price: number;
        currency: string;
    }>;
    hideSummary?: boolean;
}) => {
    const order = useAppSelector(selectOrder) as OrderState;
    const dispatch = useAppDispatch();
    const container = useRef<HTMLDivElement>(null);
    const content = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number>(1);

    const rescale = () => {
        if (!content.current || !container.current) return;
        const maxWidth = container.current.clientWidth;
        const maxHeight = container.current.clientHeight;
        const width = content.current.clientWidth;
        const height = content.current.clientHeight;
        setScale(Math.min(width / maxWidth, height / maxHeight));
    };

    useEffect(() => {
        rescale();
    }, [container, content]);

    useEffect(() => {
        document.addEventListener("resize", rescale);
        return () => {
            document.removeEventListener("resize", rescale);
        };
    }, []);

    const createNewOrder = (): OrderState => {
        return {
            orderId: order.orderId,
            tickets: order.tickets.map((a) => a),
            ticketPersonalizationRequired: order.ticketPersonalizationRequired
        };
    };

    const addSeat = (seat: Seat) => {
        const newOrder: OrderState = createNewOrder();
        newOrder.tickets.push({
            categoryId: seat.category,
            amount: seat.amount ?? 1,
            seatId: seat.id
        });
        dispatch(setTickets(newOrder.tickets));
    };

    const removeSeat = (seat: Seat) => {
        const newOrder: OrderState = createNewOrder();
        newOrder.tickets.splice(
            newOrder.tickets.findIndex((s) => s.seatId === seat.id),
            1
        );
        dispatch(setTickets(newOrder.tickets));
    };

    const handleSelectSeat = (seat: Seat, isSelected: boolean) => {
        if (isSelected) {
            addSeat(seat);
            return;
        }
        removeSeat(seat);
    };

    return (
        <Grid container style={{ maxHeight: "100%" }} ref={container}>
            <Grid item md={12} lg={8} style={{ maxWidth: "100%" }}>
                <TransformWrapper centerOnInit centerZoomedOut minScale={scale}>
                    <TransformComponent wrapperStyle={{ width: "100%" }}>
                        <div
                            style={{ display: "flex", flexDirection: "column" }}
                            ref={content}
                        >
                            {seatSelectionDefinition.map((row, index) => (
                                <SeatSelectionRow
                                    key={`row${index}`}
                                    row={row}
                                    categories={categories}
                                    onSelectSeat={handleSelectSeat}
                                />
                            ))}
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </Grid>
            {
                !hideSummary && (
                    <Grid
                        item
                        xs={12}
                        md={12}
                        lg={4}
                        display="flex"
                        alignItems="center"
                    >
                        <Card style={{ flex: "1 1 auto", padding: "10px" }}>
                            <PaymentOverview categories={categories} displayColor />
                        </Card>
                    </Grid>
                )
            }
        </Grid>
    );
};
