export interface Order {
    information: Array<{
        categoryId: number;
        seatInformation: string;
    }>;
    ticketAmount: number;
    summary: Array<{categoryId: number; amount: number}>;
    price: number;
    valid: boolean;
}
