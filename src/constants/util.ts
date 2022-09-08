import { IAddress } from "./interfaces";
import zippo from "zippo";
import { PersonalInformationState } from "../store/reducers/personalInformationReducer";
import axios from "axios";
import { OrderState, Tickets } from "../store/reducers/orderReducer";
import { SeatMap } from "../components/seatselection/seatmap/SeatSelectionMap";

export type AddressValidator = (address: IAddress) => boolean;
export const addressValidatorMap: Record<string, AddressValidator> = {
    firstName: (address) =>
        address?.firstName != null && address.firstName.length > 1,
    lastName: (address) =>
        address?.lastName != null && address.lastName.length > 1,
    address: (address) =>
        address?.address != null &&
        address.address.length > 5 &&
        hasNumber(address.address),
    zip: (address) => zippo.validate(address?.zip),
    city: (address) => address?.city != null && address.city.length > 3,
    country: (address) => address?.country != null,
    region: (address) =>
        address?.region != null || address.country.regions.length == 0
};

export const validateAddress = (address: IAddress) => {
    return Object.values(addressValidatorMap).every((addressValidator) =>
        addressValidator(address)
    );
};

export const hasNumber = (myString) => {
    return /\d/.test(myString);
};

export const storeOrderAndUser = async (
    order: OrderState,
    user: PersonalInformationState,
    eventId,
    paymentType
) => {
    if (order.orderId || user.userId)
        return { userId: user.userId, orderId: order.orderId };
    const response = await axios.post("/api/order/store", {
        order: order,
        user: user,
        eventId: eventId,
        paymentType: paymentType,
        locale: navigator.language
    });
    return { userId: response.data.userId, orderId: response.data.orderId };
};

export const getStoreWithOrderId = async (
    orderId
): Promise<{
    personalInformation: PersonalInformationState;
    order: OrderState;
    eventId: number;
}> => {
    const response = await axios.post("/api/order", { orderId: orderId });
    const { user, order, eventId } = response.data;
    return { personalInformation: user, order: order, eventId: eventId };
};

export const validatePayment = async (orderId): Promise<boolean> => {
    if (!orderId || orderId === "") return false;
    const response = await axios.post("api/order/validate_intent", {
        orderId: orderId
    });
    return response.data.valid;
};

export const ticketsOccupied = (tickets: Tickets, seatMap: SeatMap) => {
    return tickets.some(ticket => seatMap.flat().find(seat => seat.id === ticket.seatId).occupied);
}

export const validateCategoriesWithSeatMap = (tickets: Tickets, seatMap: SeatMap): Tickets => {
    return tickets.map(ticket => ({...ticket, categoryId: seatMap.flat().find(seat => seat.id === ticket.seatId).category}));
}

export const calculateTotalPrice = (
    tickets: Tickets,
    categories: Array<{ id: number; price: number }>
): number => {
    return tickets.reduce((a, ticket) => a + ticket.amount * categories.find(category => category.id === ticket.categoryId).price, 0);
};

export const totalTicketAmount = (order: OrderState): number => {
    return order.tickets.length;
};

export const summarizeTicketAmount = (tickets: Tickets, categories: Array<{id: number;}>, hideEmptyCategories?: boolean) => {
    let items = categories
        .map(category => ({categoryId: category.id, amount: tickets.filter(ticket => ticket.categoryId === category.id).length}));
    if (hideEmptyCategories)
        return items.filter(item => item.amount > 0);
    return items;
}

export const formatPrice = (price: number, currency: string): string => {
    if (typeof navigator === "undefined") return "";
    return new Intl.NumberFormat(navigator.language, {
        style: "currency",
        currency: currency
    }).format(price);
};
export const arrayEquals = (a, b) => {
    return (
        Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val) => b.indexOf(val) !== -1)
    );
};

export const encodeTicketQR = (ticketId, secret) => {
    return Buffer.from(JSON.stringify({id: ticketId, secret: secret})).toString("base64");
}

export const decodeTicketQR = (readValue): {id: string; secret: string} => {
    const buffer = new Buffer(readValue, "base64");
    return JSON.parse(buffer.toString());
}
