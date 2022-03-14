import fs from "fs";
import { generateInvoice } from "./invoice";
import { generateTickets } from "./ticket";
import prisma from "./prisma";
import { ShippingFactory } from "../store/factories/shipping/ShippingFactory";
import { DownloadShipping } from "../store/factories/shipping/DownloadShipping";
import { getEmailTransporter } from "./email";
import ejs from "ejs";
import {
    PaymentFactory,
    PaymentType,
} from "../store/factories/payment/PaymentFactory";
import { getStaticAssetFile } from "../constants/serverUtil";
import { totalTicketAmount } from "../constants/util";
import { IOrder } from "../store/reducers/orderReducer";

export const send = async (orderId) => {
    return new Promise<void>(async (resolve, reject) => {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: {
                shipping: true,
                user: true,
                order: true,
                tickets: true,
                paymentResult: true,
                paymentType: true,
            },
        });

        // generate invoice
        const invoicePath = await generateInvoice(
            getStaticAssetFile("invoice/template.html", "utf-8"),
            orderId
        );

        const message: any = {
            from: process.env.EMAIL_SENDER,
            to: order.user.email,
            subject: "Your ticket order!",
            html: null,
            attachments: [
                {
                    filename: "Invoice.pdf",
                    path: invoicePath,
                    contentType: "application/pdf",
                },
            ],
        };

        // generate tickets
        const shipping = ShippingFactory.getShippingInstance(
            JSON.parse(order.shipping)
        );
        // TODO: Replace by factory
        const ticketsAlreadySent =
            totalTicketAmount(JSON.parse(order.order) as IOrder) <=
            order.tickets.length;
        const payed =
            PaymentFactory.getPaymentInstance({
                data: null,
                type: order.paymentType as PaymentType,
            })?.paymentResultValid(order.paymentResult) ?? false;
        let containsTickets = undefined;
        if (
            shipping instanceof DownloadShipping &&
            !ticketsAlreadySent &&
            payed
        ) {
            const tickets = await generateTickets(
                getStaticAssetFile("ticket/template.pdf"),
                orderId
            );
            tickets.forEach((ticket, i) => {
                message.attachments.push({
                    filename: `Ticket${i + 1}.pdf`,
                    content: ticket,
                    contentType: "application/pdf",
                });
            });
            containsTickets = true;
        }
        message.html = ejs.render(
            getStaticAssetFile("email/template.html", "utf-8"),
            {
                customerName: order.user.firstName + " " + order.user.lastName,
                containsTickets: containsTickets,
            }
        );

        (await getEmailTransporter()).sendMail(message, (error) => {
            if (error) {
                reject(error);
                return;
            }
            fs.unlinkSync(invoicePath);
            resolve();
        });
    });
};
