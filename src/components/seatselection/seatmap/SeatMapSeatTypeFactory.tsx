import { OnSeatSelect, Seat, SeatMapSeat, SeatMapSpace } from "./SeatMapSeat";

interface SeatType extends Seat {
    type: "seat" | "space";
}

export const SeatMapSeatTypeFactory = ({
    data,
    categories,
    onSelectSeat,
    forceNoRedux,
    index
}: {
    data: SeatType;
    categories;
    onSelectSeat?: OnSeatSelect;
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
            />
        );
    }
    if (data.type === "space") {
        return <SeatMapSpace seat={data} />;
    }
};
