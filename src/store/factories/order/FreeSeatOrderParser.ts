import { Order } from "./Order";
import { FreeSeatOrder, IOrder } from "../../reducers/orderReducer";

export class FreeSeatOrderParser implements Order {
    private order: IOrder;
    private categories;

    constructor(order, categories) {
        this.order = order;
        this.categories = categories;
    }

    get information(): Array<{ categoryId: number; seatInformation: string }> {
        return (this.order as FreeSeatOrder).orders
            .map((order) =>
                Array.from(Array(order.amount).keys()).map(() => {
                    return {
                        categoryId: order.categoryId,
                        seatInformation: this.categories?.find(
                            (category) => category.id === order.categoryId
                        ).label
                    };
                })
            )
            .flat();
    }

    get summary(): Array<{categoryId: number; amount: number}> {
        return (this.order as FreeSeatOrder).orders.map((order) => {
            return { categoryId: order.categoryId, amount: order.amount };
        })
    }

    get ticketAmount(): number {
        return (this.order as FreeSeatOrder).orders.reduce(
            (a, seat) => a + seat.amount,
            0
        );
    }

    get price(): number {
        return (this.order as FreeSeatOrder).orders.reduce(
            (total, order) => {
                const category = this.categories.find(cat => cat.id === order.categoryId)
                if (!category) return total + order.price;
                return total + category.price * order.amount
            },
            0
        );
    }

    get valid(): boolean {
        return (this.order as FreeSeatOrder).orders.every(
            (value) => value.amount > 0 && value.categoryId >= 0
        );
    }
}
