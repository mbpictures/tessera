import { PDFDocument } from "pdf-lib";
import prisma from "./prisma";
import QRCode from "qrcode";
import { formatPrice } from "../constants/serverUtil";
import {randomBytes} from "crypto";
import { encodeTicketQR } from "../constants/util";

const fillTextField = (form, fieldName, value) => {
    const field = form.getTextField(fieldName);
    if (!field) return;
    field.setText(value);
};

require('crypto').randomBytes(48, function(err, buffer) { var token = buffer.toString('hex'); console.log(token); });
const getTicketSecret = () => {
    const bytes = randomBytes(48);
    return bytes.toString('base64');
}

const generateTicket = async (
    template,
    details: { seatInformation; price; name; currency; locale },
    eventName: string,
    ticketId
): Promise<Uint8Array> => {
    return new Promise<Uint8Array>(async (resolve, reject) => {
        try {
            const pdfDoc = await PDFDocument.load(template);
            const form = pdfDoc.getForm();
            fillTextField(form, "EVENT_NAME", eventName);
            fillTextField(form, "SEAT_INFORMATION", details.seatInformation ?? "");
            fillTextField(
                form,
                "PRICE",
                formatPrice(details.price, details.currency, details.locale)
            );
            fillTextField(form, "CUSTOMER_NAME", details.name);

            const secret = getTicketSecret();

            await prisma.ticket.update({
                data: {
                    secret
                },
                where: {
                    id: ticketId
                }
            });
            QRCode.toDataURL(
                encodeTicketQR(ticketId, secret),
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
            event: true,
            user: true,
            locale: true,
            tickets: true
        }
    });

    const categories = await prisma.category.findMany();

    return await Promise.all(
        orderDB.tickets.map(async (ticket) => {
            const category = categories.find(
                (category) => category.id === ticket.categoryId
            );
            return await generateTicket(
                template,
                {
                    seatInformation: ticket.seatId ?? category.label,
                    price: category.price,
                    name: orderDB.user.firstName + " " + orderDB.user.lastName,
                    currency: category.currency,
                    locale: orderDB.locale
                },
                orderDB.event.title,
                ticket.id
            );
        })
    );
};
