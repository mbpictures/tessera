import {SeatRow, SeatSelectionRow} from "./SeatSelectionRow";
import {TransformWrapper, TransformComponent} from "react-zoom-pan-pinch";
import {Card, Grid} from "@mui/material";
import {useAppDispatch, useAppSelector} from "../../store/hooks";
import {SeatOrder, selectOrder, setOrder} from "../../store/reducers/orderReducer";
import {useEffect} from "react";
import {Seat} from "./SeatMapSeat";
import {disableNextStep, enableNextStep} from "../../store/reducers/nextStepAvailableReducer";

export type SeatMap = Array<SeatRow>;

export const SeatSelectionMap = ({seatSelectionDefinition, categories}: {seatSelectionDefinition: SeatMap, categories: Array<{id: number, label: string, price: number}>}) => {
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

    const addSeat = (seat: Seat) => {
        const newOrder: SeatOrder = createNewOrder();
        newOrder.seats.push(seat);
        newOrder.totalPrice = getPrice(newOrder);
        newOrder.ticketAmount = newOrder.seats.length;
        dispatch(setOrder(newOrder));
    };

    const removeSeat = (seat: Seat) => {
        const newOrder: SeatOrder = createNewOrder();
        newOrder.seats.splice(newOrder.seats.findIndex(s => s.id === seat.id), 1);
        newOrder.totalPrice = getPrice(newOrder);
        newOrder.ticketAmount = newOrder.seats.length;
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
        <Grid container>
            <Grid item md={12} lg={8} style={{width: "100%"}}>
                <TransformWrapper centerOnInit centerZoomedOut>
                    <TransformComponent wrapperStyle={{width: "100%"}}>
                        <div style={{display: "flex", flexDirection: "column"}}>
                            {
                                seatSelectionDefinition.map((row, index) => <SeatSelectionRow key={`row${index}`} row={row} categories={categories} onSelectSeat={handleSelectSeat} />)
                            }
                        </div>
                    </TransformComponent>
                </TransformWrapper>
            </Grid>
            <Grid item md={12} lg={4} display="flex" alignItems="center">
                <Card style={{flex: "1 1 auto", padding: "10px"}}>
                    {order.totalPrice} €
                </Card>
            </Grid>
        </Grid>
    );
};
