import { OnContextMenu, OnSeatSelect, Seat, SeatMapSeat, SeatMapSpace } from "./SeatMapSeat";

interface SeatType extends Seat {
    type: "seat" | "space";
}

export const SeatMapSeatTypeFactory = ({
    data,
    categories,
    onSelectSeat,
    forceNoRedux,
    index,
    onContextMenu
}: {
    data: SeatType;
    categories;
    onSelectSeat?: OnSeatSelect;
    onContextMenu?: OnContextMenu;
    forceNoRedux?: boolean;
    index: number;
}) => {
    if (data.type === "seat") {
        return (
            <SeatMapSeat
                seat={data}
                categories={categories}
                onSeatSelect={onSelectSeat}
                forceNoRedux={forceNoRedux}
                index={index}
                onContextMenu={onContextMenu}
            />
        );
    }
    if (data.type === "space") {
        return <SeatMapSpace seat={data} />;
    }
};
