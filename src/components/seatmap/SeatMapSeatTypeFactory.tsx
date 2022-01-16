import { OnSeatSelect, Seat, SeatMapSeat, SeatMapSpace } from "./SeatMapSeat";

interface SeatType extends Seat {
    type: "seat" | "space";
}

export const SeatMapSeatTypeFactory = ({
    data,
    categories,
    onSelectSeat,
    forceNoRedux
}: {
    data: SeatType;
    categories;
    onSelectSeat?: OnSeatSelect;
    forceNoRedux?: boolean;
}) => {
    if (data.type === "seat") {
        return (
            <SeatMapSeat
                seat={data}
                categories={categories}
                onSeatSelect={onSelectSeat}
                forceNoRedux={forceNoRedux}
            />
        );
    }
    if (data.type === "space") {
        return <SeatMapSpace seat={data} />;
    }
};
