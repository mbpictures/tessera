import prisma from "./prisma";
import ejs from "ejs";
import htmlPdf from "html-pdf";
import {
    FreeSeatOrder,
    IOrder,
    SeatOrder
} from "../store/reducers/orderReducer";
import { calculateTotalPrice } from "../constants/util";
import { formatPrice } from "../constants/serverUtil";
import { PaymentType } from "../store/factories/payment/PaymentFactory";

export const generateInvoice = async (
    template,
    orderId: string
): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
        const orderDB = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                order: true,
                user: true,
                event: true,
                locale: true,
                paymentType: true,
                paymentIntent: true
            }
        });

        const parsedOrder = JSON.parse(orderDB.order) as IOrder;
        const categories = await prisma.category.findMany();
        const totalPrice = calculateTotalPrice(parsedOrder, categories);

        let orders: Array<{ categoryId: number; amount: number }> = [];
        // TODO: replace by factory
        if ("seats" in parsedOrder) {
            orders = (parsedOrder as SeatOrder).seats.map((seat) => {
                return {
                    categoryId: seat.category,
                    amount: seat.amount
                };
            });
        }
        if ("orders" in parsedOrder) {
            orders = (parsedOrder as FreeSeatOrder).orders.map((order) => {
                return {
                    categoryId: order.categoryId,
                    amount: order.amount
                };
            });
        }

        let purpose = undefined;
        if (orderDB.paymentType === PaymentType.Invoice) {
            purpose = JSON.parse(orderDB.paymentIntent).invoicePurpose;
        }

        const date = new Date();
        const html = ejs.render(template, {
            invoice_number: 1,
            creation_date: `${date.getDate()}. ${date.getMonth()} ${date.getFullYear()}`,
            receiver: [
                orderDB.user.firstName + " " + orderDB.user.lastName,
                orderDB.user.address,
                orderDB.user.zip + " " + orderDB.user.city
            ],
            products: orders.map((order) => {
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
            }),
            total_net_price: formatPrice(
                totalPrice * 0.81,
                categories[0].currency,
                orderDB.locale
            ),
            tax_amount: "19%",
            total_price: formatPrice(
                totalPrice,
                categories[0].currency,
                orderDB.locale
            ),
            bank_information: [
                "Jon Doe",
                "Demo Bank",
                "IBAN: EN23 2133 2343 2343 2343"
            ],
            ...(purpose && {purpose})
        });

        // TODO: replace bank information by database

        htmlPdf
            .create(html, { format: "A4" })
            .toFile(`temp/${orderId}.pdf`, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res.filename);
            });
    });
};
