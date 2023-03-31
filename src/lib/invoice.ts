import prisma from "./prisma";
import ejs from "ejs";
import { calculateTotalPrice, getEventTitle, getServiceFeeAmount, summarizeTicketAmount } from "../constants/util";
import { formatPrice } from "../constants/serverUtil";
import { PaymentType } from "../store/factories/payment/PaymentFactory";
import { getOption } from "./options";
import { Options } from "../constants/Constants";
import unescape from "lodash/unescape";
import { generatePdf } from "./htmlToPdf";

export const generateInvoice = async (
    template,
    orderId: string
): Promise<Uint8Array> => {
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
    const currency = await getOption(Options.Currency);
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
                currency,
                orderDB.locale
            ),
            amount: order.amount,
            total_price: formatPrice(
                category.price * order.amount,
                currency,
                orderDB.locale
            )
        };
    });
    if (getServiceFeeAmount(shippingFees, JSON.parse(orderDB.shipping).type) !== 0) {
        products.push({
            name: "Shipping Fee",
            unit_price: formatPrice(
                getServiceFeeAmount(shippingFees, JSON.parse(orderDB.shipping).type),
                currency,
                orderDB.locale
            ),
            amount: 1,
            total_price: formatPrice(
                getServiceFeeAmount(shippingFees, JSON.parse(orderDB.shipping).type),
                currency,
                orderDB.locale
            )
        })
    }
    if (getServiceFeeAmount(paymentFees, orderDB.paymentType) !== 0) {
        products.push({
            name: "Payment Fee",
            unit_price: formatPrice(
                getServiceFeeAmount(paymentFees, orderDB.paymentType),
                currency,
                orderDB.locale
            ),
            amount: 1,
            total_price: formatPrice(
                getServiceFeeAmount(paymentFees, orderDB.paymentType),
                currency,
                orderDB.locale
            )
        })
    }

    const invoiceNumber = (await getOption(Options.InvoiceNumber)) + 1;

    const html = ejs.render(unescape(template.toString()), {
        invoice_number: invoiceNumber,
        creation_date: date.toLocaleDateString(orderDB.locale),
        receiver: [
            orderDB.user.firstName + " " + orderDB.user.lastName,
            orderDB.user.address,
            orderDB.user.zip + " " + orderDB.user.city
        ],
        products: products,
        total_net_price: formatPrice(
            totalPrice * (1 - (taxAmount / 100)),
            currency,
            orderDB.locale
        ),
        tax_amount: `${taxAmount}%`,
        total_price: formatPrice(
            totalPrice,
            currency,
            orderDB.locale
        ),
        bank_information: (await getOption(Options.PaymentDetails)),
        ...(purpose && {purpose}),
        event_name: getEventTitle(orderDB.eventDate)
    });

    return await generatePdf(html, {format: "A4"});
};
