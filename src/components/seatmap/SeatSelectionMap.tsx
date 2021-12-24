import {SeatRow, SeatSelectionRow} from "./SeatSelectionRow";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import {Card, Grid} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {SeatOrder, selectOrder, setOrder} from "../../store/reducers/orderReducer";
import {useEffect, useRef, useState} from "react";
import {Seat} from "./SeatMapSeat";
import {disableNextStep, enableNextStep} from "../../store/reducers/nextStepAvailableReducer";
import {PaymentOverview} from "../PaymentOverview";

export type SeatMap = Array<SeatRow>;

export const SeatSelectionMap = ({seatSelectionDefinition, categories}: {seatSelectionDefinition: SeatMap, categories: Array<{id: number, label: string, price: number}>}) => {
    const order = useAppSelector(selectOrder) as SeatOrder;
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
        if (order.seats) return;
        const newOrder: SeatOrder = {
            ticketAmount: -1,
            totalPrice: -1,
            seats: []
        }
        dispatch(setOrder(newOrder));
        document.addEventListener("resize", rescale);
        return () => {
            document.removeEventListener("resize", rescale);
        };
    }, []);

    useEffect(() => {
        if (order.ticketAmount <= 0) {
            dispatch(disableNextStep());
            return;
        }
        dispatch(enableNextStep());
    }, [order]);

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

    const getTicketAmount = (order: SeatOrder) => {
        return order.seats.reduce((a, seat) => a + seat.amount, 0);
    };

    const addSeat = (seat: Seat) => {
        const newOrder: SeatOrder = createNewOrder();
        newOrder.seats.push(seat);
        newOrder.totalPrice = getPrice(newOrder);
        newOrder.ticketAmount = getTicketAmount(newOrder);
        dispatch(setOrder(newOrder));
    };

    const removeSeat = (seat: Seat) => {
        const newOrder: SeatOrder = createNewOrder();
        newOrder.seats.splice(newOrder.seats.findIndex(s => s.id === seat.id), 1);
        newOrder.totalPrice = getPrice(newOrder);
        newOrder.ticketAmount = getTicketAmount(newOrder);
        dispatch(setOrder(newOrder));
    };

    const handleSelectSeat = (seat: Seat, isSelected: boolean) => {
        if (isSelected) {
            addSeat(seat);
            return;
        }
        removeSeat(seat);
    };

    return (
        <Grid container style={{maxHeight: "100%"}} ref={container}>
            <Grid item md={12} lg={8} style={{maxWidth: "100%"}}>
                <TransformWrapper centerOnInit centerZoomedOut minScale={scale}>
                    <TransformComponent wrapperStyle={{width: "100%"}}>
                        <div style={{display: "flex", flexDirection: "column"}} ref={content}>
                            {
                                seatSelectionDefinition.map((row, index) => <SeatSelectionRow key={`row${index}`} row={row} categories={categories} onSelectSeat={handleSelectSeat} />)
                            }
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </Grid>
            <Grid item xs={12} md={12} lg={4} display="flex" alignItems="center">
                <Card style={{flex: "1 1 auto", padding: "10px"}}>
                    <PaymentOverview categories={categories} displayColor />
                </Card>
            </Grid>
        </Grid>
    );
};
