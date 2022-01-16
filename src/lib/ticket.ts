import { PDFDocument } from "pdf-lib";
import prisma from "./prisma";
import QRCode from "qrcode";
import {
    FreeSeatOrder,
    IOrder,
    SeatOrder
} from "../store/reducers/orderReducer";
import { formatPrice } from "../constants/serverUtil";

const fillTextField = (form, fieldName, value) => {
    const field = form.getTextField(fieldName);
    if (!field) return;
    field.setText(value);
};

const generateTicket = async (
    template,
    details: { seatInformation; price; name; currency; locale },
    eventName: string,
    orderId
): Promise<Uint8Array> => {
    return new Promise<Uint8Array>(async (resolve, reject) => {
        try {
            const pdfDoc = await PDFDocument.load(template);
            const form = pdfDoc.getForm();
            fillTextField(form, "EVENT_NAME", eventName);
            fillTextField(form, "SEAT_INFORMATION", details.seatInformation);
            fillTextField(
                form,
                "PRICE",
                formatPrice(details.price, details.currency, details.locale)
            );
            fillTextField(form, "CUSTOMER_NAME", details.name);

            const ticket = await prisma.ticket.create({
                data: {
                    order: {
                        connect: { id: orderId }
                    }
                }
            });
            QRCode.toDataURL(
                ticket.id,
                { errorCorrectionLevel: "H" },
                async (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const qrCode = await pdfDoc.embedPng(data);
                    const qrCodeField = form.getButton("QR_CODE");
                    qrCodeField.setImage(qrCode);

                    form.flatten();
                    resolve(await pdfDoc.save());
                }
            );
        } catch (e) {
            reject(e);
        }
    });
};

export const generateTickets = async (
    template,
    orderId: string
): Promise<Array<Uint8Array>> => {
    const orderDB = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        select: {
            id: true,
            order: true,
            event: true,
            user: true,
            locale: true
        }
    });

    const order = JSON.parse(orderDB.order) as IOrder;

    const categories = await prisma.category.findMany();

    let orders: Array<{ categoryId: number; seatInformation: string }> = [];
    // TODO: replace by factory
    if ("seats" in order) {
        orders = (order as SeatOrder).seats
            .map((seat) =>
                Array.from(Array(seat.amount).keys()).map(() => {
                    return {
                        categoryId: seat.category,
                        seatInformation: `Seat ${seat.id}` // TODO: add seat id to seat information factory
                    };
                })
            )
            .flat();
    }
    if ("orders" in order) {
        orders = (order as FreeSeatOrder).orders
            .map((order) =>
                Array.from(Array(order.amount).keys()).map(() => {
                    return {
                        categoryId: order.categoryId,
                        seatInformation: `Category: ${
                            categories.find(
                                (category) => category.id === order.categoryId
                            ).label
                        }`
                    };
                })
            )
            .flat();
    }

    return await Promise.all(
        orders.map(async (order) => {
            const category = categories.find(
                (category) => category.id === order.categoryId
            );
            return await generateTicket(
                template,
                {
                    seatInformation: order.seatInformation,
                    price: category.price,
                    name: orderDB.user.firstName + " " + orderDB.user.lastName,
                    currency: category.currency,
                    locale: orderDB.locale
                },
                orderDB.event.title,
                orderDB.id
            );
        })
    );
};
