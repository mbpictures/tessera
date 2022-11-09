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
    onContextMenu,
    currency
}: {
    data: SeatType;
    categories;
    onSelectSeat?: OnSeatSelect;
    onContextMenu?: OnContextMenu;
    forceNoRedux?: boolean;
    index: number;
    currency: string;
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
                currency={currency}
            />
        );
    }
    if (data.type === "space") {
        return <SeatMapSpace seat={data} />;
    }
};
