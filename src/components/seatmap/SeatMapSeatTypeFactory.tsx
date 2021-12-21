import {OnSeatSelect, Seat, SeatMapSeat, SeatMapSpace} from "./SeatMapSeat";

interface SeatType extends Seat {
    type: "seat" | "space";
}

export const SeatMapSeatTypeFactory = ({data, categories, onSelectSeat}: {data: SeatType, categories, onSelectSeat?: OnSeatSelect}) => {
    if (data.type === "seat") {
        return <SeatMapSeat seat={data} categories={categories} onSeatSelect={onSelectSeat} />
    }
    if (data.type === "space") {
        return <SeatMapSpace seat={data} />
    }

};
