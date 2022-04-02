import { PDFDocument } from "pdf-lib";
import prisma from "./prisma";
import QRCode from "qrcode";
import { IOrder } from "../store/reducers/orderReducer";
import { formatPrice } from "../constants/serverUtil";
import { OrderFactory } from "../store/factories/order/OrderFactory";

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

    let orders: Array<{ categoryId: number; seatInformation: string }> = OrderFactory.getInstance(order, categories).information;

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
