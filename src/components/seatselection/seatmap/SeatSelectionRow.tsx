import { OnContextMenu, OnSeatSelect, Seat } from "./SeatMapSeat";
import { SeatMapSeatTypeFactory } from "./SeatMapSeatTypeFactory";

export type SeatRow = Array<Seat>;

export const SeatSelectionRow = ({
    row,
    categories,
    onSelectSeat,
    forceNoRedux,
    onContextMenu
}: {
    row: SeatRow;
    categories: Array<{ id: number; label: string; price: number }>;
    onSelectSeat?: OnSeatSelect;
    onContextMenu?: OnContextMenu;
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
                    onContextMenu={onContextMenu}
                    index={index}
                />
            ))}
        </div>
    );
};
