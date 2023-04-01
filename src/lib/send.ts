import { generateInvoice } from "./invoice";
import { generateTickets } from "./ticket";
import prisma from "./prisma";
import { ShippingFactory, ShippingType } from "../store/factories/shipping/ShippingFactory";
import { getEmailTransporter } from "./email";
import ejs from "ejs";
import { PaymentFactory, PaymentType } from "../store/factories/payment/PaymentFactory";
import { getStaticAssetFile } from "../constants/serverUtil";
import { getIcalData } from "./ical";
import {
    getGoogleWalletTicketLink,
    getGoogleWalletTicketLinkFromObjectId,
    validateConfiguration
} from "./googleWallet";
import { getOption, getOptionData, setOption } from "./options";
import { Options } from "../constants/Constants";
import unescape from "lodash/unescape";
import getT from 'next-translate/getT';

export const getEmailHtml = async (firstName, lastName, containsTickets, containsInvoice, eventDate, tickets, cancellationLink, isCancellation) => {
    let googleWallet = undefined;
    if (containsTickets && validateConfiguration()) {
        try {
            const links: {objectId: string, link: string}[] = await Promise.all(
                tickets.map(async (ticket): Promise<{objectId: string, link: string}> => await getGoogleWalletTicketLink(eventDate, ticket))
            );
            googleWallet = {
                allTicketsLink: getGoogleWalletTicketLinkFromObjectId(links.map(link => link.objectId)),
                ticketLinks: links.map(link => link.link)
            }
        } catch (e) {
            console.log(e);
        }
    }

    const html = !isCancellation ?
        await getOptionData(Options.TemplateConfirmEmail, getStaticAssetFile("email/template.html", "utf-8")) :
        await getOptionData(Options.TemplateCancellationEmail, getStaticAssetFile("email/cancellation.html", "utf-8"));
    return ejs.render(
        unescape(html.data.toString()),
        {
            customerName: firstName + " " + lastName,
            containsTickets: containsTickets,
            containsInvoice: containsInvoice ? true : undefined,
            googleWallet: googleWallet,
            cancellationLink: cancellationLink
        }
    );
}

export const send = async (orderId, isCancellation?: boolean) => {
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
                },
                cancellationSecret: true,
                locale: true
            },
        });
        const t = await getT(order.locale.includes("-") ? order.locale.split("-")[0] : order.locale, "mail");

       let attachments = [];
        // generate invoice
        let containsInvoice = false;
        if (!order.invoiceSent || isCancellation) {
            const invoiceData = await generateInvoice(
                (await getOptionData(Options.TemplateInvoice, getStaticAssetFile("invoice/template.html", "utf-8"))).data,
                orderId
            );

            attachments.push({
                filename: t("invoice-filename"),
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
                (await getOptionData(Options.TemplateTicket, getStaticAssetFile("ticket/template.pdf"))).data,
                orderId
            );
            tickets.forEach((ticket, i) => {
                attachments.push({
                    filename: t("ticket-filename", {number: i + 1}),
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
            subject: t("email-title"),
            html: null,
            attachments
        };

        if (order.eventDate.date) {
            message["icalEvent"] = getIcalData(order.eventDate);
        }

        const tickets = await prisma.ticket.findMany({
            where: {
                orderId: orderId
            },
            select: {
                id: true,
                secret: true,
                seatId: true,
                firstName: true,
                lastName: true,
                category: {
                    select: {
                        label: true
                    }
                },
                order: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        })
        message.html = await getEmailHtml(
            order.user.firstName,
            order.user.lastName,
            containsTickets,
            containsInvoice,
            order.eventDate,
            tickets,
            `${process.env.NEXT_PUBLIC_SHOP_DOMAIN}/refund?orderId=${orderId}&secret=${encodeURIComponent(order.cancellationSecret)}`,
            isCancellation
        );

        (await getEmailTransporter()).sendMail(message, async (error) => {
            if (error) {
                reject(error);
                return;
            }

            if (containsInvoice) {
                await setOption(Options.InvoiceNumber, (await getOption(Options.InvoiceNumber)) + 1);
                await prisma.order.update({
                    where: {
                        id: orderId
                    },
                    data: {
                        invoiceSent: true
                    }
                });
            }

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
