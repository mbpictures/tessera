import pathA from "path";
import fs from "fs";
import {generateInvoice} from "./invoice";
import {generateTickets} from "./ticket";
import prisma from "./prisma";
import {ShippingFactory} from "../store/factories/shipping/ShippingFactory";
import {DownloadShipping} from "../store/factories/shipping/DownloadShipping";
import {getEmailTransporter} from "./email";
import ejs from "ejs";

export const send = async (orderId) => {
    return new Promise<void>(async (resolve, reject) => {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                shipping: true,
                user: true,
                order: true,
                tickets: true
            }
        });

        // generate invoice
        const assetPath = pathA.join(process.cwd(), 'src/assets/');
        const invoiceTemplatePath = pathA.join(assetPath, "invoice/template.html");
        const invoiceTemplate = fs.readFileSync(invoiceTemplatePath, 'utf-8');
        const invoicePath = await generateInvoice(invoiceTemplate, orderId);

        const message: any = {
            from: process.env.EMAIL_SENDER,
            to: order.user.email,
            subject: "Your ticket order!",
            html: null,
            attachments: [
                {
                    filename: "Invoice.pdf",
                    path: invoicePath,
                    contentType: 'application/pdf'
                }
            ]
        };

        // generate tickets
        const shipping = ShippingFactory.getShippingInstance(JSON.parse(order.shipping));
        const ticketsAlreadySent = JSON.parse(order.order).orders.map(order => Array.from(Array(order.amount).keys())).flat().length <= order.tickets.length;

        let containsTickets = undefined;
        if (shipping instanceof DownloadShipping && !ticketsAlreadySent) {
            const ticketTemplatePath = pathA.join(assetPath, "ticket/template.pdf");
            const ticketTemplate = fs.readFileSync(ticketTemplatePath);
            const tickets = await generateTickets(ticketTemplate, orderId);
            tickets.forEach((ticket, i) => {
                message.attachments.push({
                    filename: `Ticket${i + 1}.pdf`,
                    content: ticket,
                    contentType: 'application/pdf'
                })
            });
            containsTickets = true;
        }
        message.html = ejs.render(fs.readFileSync(pathA.join(assetPath, "email/template.html"), 'utf-8'), {
            customerName: order.user.firstName + " " + order.user.lastName,
            containsTickets: containsTickets
        });

        (await getEmailTransporter()).sendMail(message, (error) => {
            if (error) {
                reject(error);
                return;
            }
            fs.unlinkSync(invoicePath);
            resolve();
        })
    })
}
