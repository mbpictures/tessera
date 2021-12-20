import {Seat} from "./SeatMapSeat";
import {SeatMapSeatTypeFactory} from "./SeatMapSeatTypeFactory";

export type SeatRow = Array<Seat>;

export const SeatSelectionRow = ({row, categories}: {row: SeatRow, categories: Array<{id: number, label: string, price: number}>}) => {
    return (
        <div style={{display: "flex"}}>
            {
                row.map((seat, index) => <SeatMapSeatTypeFactory key={`seat${index}`} data={seat} categories={categories} />)
            }
        </div>
    )
};
