import fs from "fs";
import { generateInvoice } from "./invoice";
import { generateTickets } from "./ticket";
import prisma from "./prisma";
import { ShippingFactory, ShippingType } from "../store/factories/shipping/ShippingFactory";
import { getEmailTransporter } from "./email";
import ejs from "ejs";
import { PaymentFactory, PaymentType } from "../store/factories/payment/PaymentFactory";
import { getStaticAssetFile } from "../constants/serverUtil";

export const getEmailHtml = (firstName, lastName, containsTickets, invoicePath) => {
    return ejs.render(
      getStaticAssetFile("email/template.html", "utf-8"),
      {
          customerName: firstName + " " + lastName,
          containsTickets: containsTickets,
          containsInvoice: invoicePath === undefined ? undefined : true
      }
    );
}

export const send = async (orderId) => {
    return new Promise<void>(async (resolve, reject) => {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: {
                shipping: true,
                user: true,
                tickets: true,
                paymentResult: true,
                paymentType: true,
                invoiceSent: true
            },
        });

       let attachments = [];
       let invoicePath = undefined;
        // generate invoice
       if (!order.invoiceSent) {
           invoicePath = await generateInvoice(
               getStaticAssetFile("invoice/template.html", "utf-8"),
               orderId
           );

           await prisma.order.update({
               where: {
                   id: orderId
               },
               data: {
                   invoiceSent: true
               }
           });

           attachments.push({
               filename: "Invoice.pdf",
               path: invoicePath,
               contentType: "application/pdf",
           });
       }

        // generate tickets
        const shipping = ShippingFactory.getShippingInstance(
            JSON.parse(order.shipping)
        );
        const ticketsAlreadySent = order.tickets.every(ticket => ticket.secret !== "" && ticket.secret !== null && ticket.secret !== undefined);
        const payed =
            PaymentFactory.getPaymentInstance({
                data: null,
                type: order.paymentType as PaymentType,
            })?.paymentResultValid(order.paymentResult) ?? false;
        let containsTickets = undefined;
        if (
            shipping.shippingData.type === ShippingType.Download &&
            !ticketsAlreadySent &&
            payed
        ) {
            const tickets = await generateTickets(
                getStaticAssetFile("ticket/template.pdf"),
                orderId
            );
            tickets.forEach((ticket, i) => {
                attachments.push({
                    filename: `Ticket${i + 1}.pdf`,
                    content: ticket,
                    contentType: "application/pdf",
                });
            });
            containsTickets = true;
        }

        if (attachments.length === 0) {
            resolve();
            return;
        }

        const message: any = {
            from: process.env.EMAIL_SENDER,
            to: order.user.email,
            subject: "Your ticket order!",
            html: null,
            attachments
        };

        message.html = getEmailHtml(order.user.firstName, order.user.lastName, containsTickets, invoicePath);

        (await getEmailTransporter()).sendMail(message, (error) => {
            if (error) {
                reject(error);
                return;
            }
            if (invoicePath !== undefined)
                fs.unlinkSync(invoicePath);
            resolve();
        });
    });
};
