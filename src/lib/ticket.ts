import { PDFDocument } from "pdf-lib";
import prisma from "./prisma";
import QRCode from "qrcode";
import { formatPrice, getStaticAssetFile } from "../constants/serverUtil";
import {randomBytes} from "crypto";
import { encodeTicketQR } from "../constants/util";

const fillTextField = (form, fieldName, value) => {
    const field = form.getTextField(fieldName);
    if (!field) return;
    field.setText(value);
};

const getTicketSecret = () => {
    const bytes = randomBytes(48);
    return bytes.toString('base64');
}

export const generateTicketSecret = async (ticketId) => {
    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketId
        }
    });
    let secret = ticket.secret;
    if (secret === null || secret === "") {
        secret = getTicketSecret();

        await prisma.ticket.update({
            data: {
                secret
            },
            where: {
                id: ticketId
            }
        });
    }
    return secret;
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

            const secret = await generateTicketSecret(ticketId);

            const qrCode = await generateQRCode(ticketId, secret);
            const qrCodeImg = await pdfDoc.embedPng(qrCode);
            const qrCodeField = form.getButton("QR_CODE");
            qrCodeField.setImage(qrCodeImg);

            form.flatten();
            resolve(await pdfDoc.save());
        } catch (e) {
            reject(e);
        }
    });
};

const generateQRCode = async (ticketId, secret): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
        QRCode.toDataURL(
            encodeTicketQR(ticketId, secret),
            { errorCorrectionLevel: "H" },
            async (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
    });
}

export const generateQRCodeWithId = async (ticketId): Promise<string> => {
    const secret = await generateTicketSecret(ticketId);
    return generateQRCode(ticketId, secret);
}

export const generateTicketWithId = async (ticketId: string): Promise<Uint8Array> => {
    const order = await prisma.ticket.findUnique({
        where: {
            id: ticketId
        },
        include: {
            order: {
                include: {
                    event: true,
                    user: true
                }
            },
            category: true
        }
    });
    return await generateTicket(
        getStaticAssetFile("ticket/template.pdf"),
        {
            seatInformation: order.seatId ?? order.category.label,
            price: order.category.price,
            name: order.order.user.firstName + " " + order.order.user.lastName,
            currency: order.category.currency,
            locale: order.order.locale
        },
        order.order.event.title,
        ticketId
    );
}

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
