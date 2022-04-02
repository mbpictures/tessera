import { Order } from "./Order";
import { IOrder, SeatOrder } from "../../reducers/orderReducer";

export class SeatOrderParser implements Order {
    private order: IOrder;
    private categories;

    constructor(order, categories) {
        this.order = order;
        this.categories = categories;
    }

    get information(): Array<{ categoryId: number; seatInformation: string }> {
        return (this.order as SeatOrder).seats
            .map((seat) =>
                Array.from(Array(seat.amount).keys()).map(() => {
                    return {
                        categoryId: seat.category,
                        seatInformation: `Seat ${seat.id}`
                    };
                })
            )
            .flat();
    }

    get summary(): Array<{categoryId: number; amount: number}> {
        const seats = (this.order as SeatOrder).seats;
        return this.categories.map((category) => {
            return {
                categoryId: category.id,
                amount: seats
                    .filter((seat) => seat.category === category.id)
                    .reduce((a, seat) => a + seat.amount, 0)
            };
        });
    }

    get ticketAmount(): number {
        return (this.order as SeatOrder).seats.reduce(
            (a, seat) => a + seat.amount,
            0
        );
    }

    get price(): number {
        return (this.order as SeatOrder).seats
            .map((seat) => {
                return {
                    amount: seat.amount,
                    price: this.categories
                        .find((cat) => cat.id === seat.category)
                        .price
                };
            })
            .reduce((a, seat) => a + seat.price * seat.amount, 0);
    }

    get valid(): boolean {
        return this.ticketAmount > 0;
    }
}
