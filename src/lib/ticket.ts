import { PDFDocument } from 'pdf-lib';
import prisma from "./prisma";
import QRCode from 'qrcode';
import {FreeSeatOrder} from "../store/reducers/orderReducer";

const fillTextField = (form, fieldName, value) => {
    const field = form.getTextField(fieldName);
    if (!field) return;
    field.setText(value);
}

const generateTicket = async (template, details: {category, price, name}, eventName: string, orderId): Promise<Uint8Array> => {
    return new Promise<Uint8Array>(async (resolve, reject) => {
        try {
            const pdfDoc = await PDFDocument.load(template);
            const form = pdfDoc.getForm();
            fillTextField(form, "EVENT_NAME", eventName);
            fillTextField(form, "SEAT_INFORMATION", details.category);
            fillTextField(form, "PRICE", details.price + "€");
            fillTextField(form, "CUSTOMER_NAME", details.name + "€");

            const ticket = await prisma.ticket.create({
                data: {
                    order: {
                        connect: {id: orderId}
                    }
                }
            });
            QRCode.toDataURL(ticket.id, async (err, data) => {
                if (err) {
                    reject(err);
                    return
                }
                const qrCode = await pdfDoc.embedPng(data);
                const qrCodeField = form.getButton('QR_CODE');
                qrCodeField.setImage(qrCode);

                form.flatten();
                resolve(await pdfDoc.save());
            })
        }
        catch (e) {
            reject(e);
        }
    })

}

export const generateTickets = async (template, orderId: string): Promise<Array<Uint8Array>> => {
    const orderDB = await prisma.order.findUnique({
        where: {
            id: orderId
        },
        select: {
            id: true,
            order: true,
            event: true,
            user: true
        }
    });

    const freeSeatOrder: FreeSeatOrder = JSON.parse(orderDB.order); // TODO: implement seatmap as well

    const categories = await prisma.category.findMany({
        where: {
            id: {
                in: freeSeatOrder.orders.map(order => order.categoryId)
            }
        }
    })

    return await Promise.all(freeSeatOrder.orders.map(async (order) => {
        const category = categories.find(category => category.id === order.categoryId);
        return await generateTicket(
            template,
            {category: category.label, price: category.price, name: orderDB.user.firstName + " " + orderDB.user.lastName},
            orderDB.event.title,
            orderDB.id
        )
    }));
}
