import {Seat, SeatMapSeat, SeatMapSpace} from "./SeatMapSeat";

interface SeatType extends Seat {
    type: "seat" | "space";
}

export const SeatMapSeatTypeFactory = ({data, categories}: {data: SeatType, categories}) => {
    if (data.type === "seat") {
        return <SeatMapSeat seat={data} categories={categories} />
    }
    if (data.type === "space") {
        return <SeatMapSpace seat={data} />
    }

};
