import { OnSeatSelect, Seat } from "./SeatMapSeat";
import { SeatMapSeatTypeFactory } from "./SeatMapSeatTypeFactory";

export type SeatRow = Array<Seat>;

export const SeatSelectionRow = ({
    row,
    categories,
    onSelectSeat,
    forceNoRedux
}: {
    row: SeatRow;
    categories: Array<{ id: number; label: string; price: number }>;
    onSelectSeat?: OnSeatSelect;
    forceNoRedux?: boolean;
}) => {
    return (
        <div style={{ display: "flex" }}>
            {row.map((seat, index) => (
                <SeatMapSeatTypeFactory
                    key={`seat${index}`}
                    data={seat}
                    categories={categories}
                    onSelectSeat={onSelectSeat}
                    forceNoRedux={forceNoRedux}
                />
            ))}
        </div>
    );
};
