import { generateInvoice } from "./invoice";
import { generateTickets } from "./ticket";
import prisma from "./prisma";
import { ShippingFactory, ShippingType } from "../store/factories/shipping/ShippingFactory";
import { getEmailTransporter } from "./email";
import ejs from "ejs";
import { PaymentFactory, PaymentType } from "../store/factories/payment/PaymentFactory";
import { getStaticAssetFile } from "../constants/serverUtil";
import { getIcalData } from "./ical";

export const getEmailHtml = (firstName, lastName, containsTickets, containsInvoice) => {
    return ejs.render(
      getStaticAssetFile("email/template.html", "utf-8"),
      {
          customerName: firstName + " " + lastName,
          containsTickets: containsTickets,
          containsInvoice: containsInvoice ? true : undefined
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
                invoiceSent: true,
                eventDate: {
                    select: {
                        title: true,
                        date: true,
                        event: true
                    }
                }
            },
        });

       let attachments = [];
        // generate invoice
        let containsInvoice = false;
       if (!order.invoiceSent) {
           const invoiceData = await generateInvoice(
               getStaticAssetFile("invoice/template.html", "utf-8"),
               orderId
           );

           attachments.push({
               filename: "Invoice.pdf",
               content: invoiceData,
               contentType: "application/pdf",
           });
           containsInvoice = true;
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

        if (order.eventDate.date) {
            message["icalEvent"] = getIcalData(order.eventDate);
        }

        message.html = getEmailHtml(order.user.firstName, order.user.lastName, containsTickets, containsInvoice);

        (await getEmailTransporter()).sendMail(message, async (error) => {
            if (error) {
                reject(error);
                return;
            }

            if (containsInvoice)
                await prisma.order.update({
                    where: {
                        id: orderId
                    },
                    data: {
                        invoiceSent: true
                    }
                });

            if (containsTickets)
                await prisma.order.update({
                    where: {
                        id: orderId
                    },
                    data: {
                        shipping: JSON.stringify(ShippingFactory.getShippingInstance({type: ShippingType.Download, data: null}).getSuccessfulShipping())
                    }
                });

            resolve();
        });
    });
};
