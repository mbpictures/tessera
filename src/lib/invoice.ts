import prisma from "./prisma";
import ejs from "ejs";
import htmlPdf from "html-pdf";
import { calculateTotalPrice, getEventTitle, getServiceFeeAmount, summarizeTicketAmount } from "../constants/util";
import { formatPrice } from "../constants/serverUtil";
import { PaymentType } from "../store/factories/payment/PaymentFactory";
import { getOption } from "./options";
import { Options } from "../constants/Constants";
import unescape from "lodash/unescape";

export const generateInvoice = async (
    template,
    orderId: string
): Promise<Uint8Array> => {
    return new Promise<Uint8Array>(async (resolve, reject) => {
        const orderDB = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                user: true,
                eventDate: {
                    select: {
                        event: true
                    }
                },
                locale: true,
                paymentType: true,
                paymentIntent: true,
                tickets: true,
                shipping: true
            }
        });
        const shippingFees = await getOption(Options.PaymentFeesShipping);
        const paymentFees = await getOption(Options.PaymentFeesPayment);

        const categories = await prisma.category.findMany();
        const totalPrice = calculateTotalPrice(
            orderDB.tickets,
            categories,
            shippingFees,
            paymentFees,
            JSON.parse(orderDB.shipping).type,
            orderDB.paymentType
        );

        let orders: Array<{ categoryId: number; amount: number }> = summarizeTicketAmount(orderDB.tickets, categories, true);

        let purpose = undefined;
        if (orderDB.paymentType === PaymentType.Invoice) {
            purpose = JSON.parse(orderDB.paymentIntent).invoicePurpose;
        }

        const date = new Date();
        const taxAmount = (await getOption(Options.TaxAmount));

        const products = orders.map((order) => {
            const category = categories.find(
                (category) => category.id === order.categoryId
            );
            return {
                name: category.label,
                unit_price: formatPrice(
                    category.price,
                    category.currency,
                    orderDB.locale
                ),
                amount: order.amount,
                total_price: formatPrice(
                    category.price * order.amount,
                    category.currency,
                    orderDB.locale
                )
            };
        });
        if (getServiceFeeAmount(shippingFees, JSON.parse(orderDB.shipping).type) !== 0) {
            products.push({
                name: "Shipping Fee",
                unit_price: formatPrice(
                    getServiceFeeAmount(shippingFees, JSON.parse(orderDB.shipping).type),
                    categories[0].currency,
                    orderDB.locale
                ),
                amount: 1,
                total_price: formatPrice(
                    getServiceFeeAmount(shippingFees, JSON.parse(orderDB.shipping).type),
                    categories[0].currency,
                    orderDB.locale
                )
            })
        }
        if (getServiceFeeAmount(paymentFees, orderDB.paymentType) !== 0) {
            products.push({
                name: "Payment Fee",
                unit_price: formatPrice(
                    getServiceFeeAmount(paymentFees, orderDB.paymentType),
                    categories[0].currency,
                    orderDB.locale
                ),
                amount: 1,
                total_price: formatPrice(
                    getServiceFeeAmount(paymentFees, orderDB.paymentType),
                    categories[0].currency,
                    orderDB.locale
                )
            })
        }

        const invoiceNumber = (await getOption(Options.InvoiceNumber)) + 1;

        const html = ejs.render(unescape(template.toString()), {
            invoice_number: invoiceNumber,
            creation_date: `${date.getDate()}. ${date.getMonth()} ${date.getFullYear()}`,
            receiver: [
                orderDB.user.firstName + " " + orderDB.user.lastName,
                orderDB.user.address,
                orderDB.user.zip + " " + orderDB.user.city
            ],
            products: products,
            total_net_price: formatPrice(
                totalPrice * (1 - (taxAmount / 100)),
                categories[0].currency,
                orderDB.locale
            ),
            tax_amount: `${taxAmount}%`,
            total_price: formatPrice(
                totalPrice,
                categories[0].currency,
                orderDB.locale
            ),
            bank_information: (await getOption(Options.PaymentDetails)),
            ...(purpose && {purpose}),
            event_name: getEventTitle(orderDB.eventDate)
        });

        htmlPdf
            .create(html, { format: "A4" })
            .toBuffer((err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
    });
};
