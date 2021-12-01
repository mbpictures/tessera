import prisma from "./prisma";
import ejs from "ejs";
import {FreeSeatOrder} from "../store/reducers/orderReducer";
import htmlPdf from "html-pdf";

export const generateInvoice = async (template, orderId: string): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            select: {
                order: true,
                user: true,
                event: true
            }
        });

        const freeSeatOrder: FreeSeatOrder = JSON.parse(order.order);
        const categories = await prisma.category.findMany({
            where: {
                id: {
                    in: freeSeatOrder.orders.map(order => order.categoryId)
                }
            }
        });
        const date = new Date();
        const html = ejs.render(template, {
            invoice_number: 1,
            creation_date: `${date.getDate()}. ${date.getMonth()} ${date.getFullYear()}`,
            receiver: [order.user.firstName + " " + order.user.lastName, order.user.address, order.user.zip + " " + order.user.city],
            products: freeSeatOrder.orders.map(order => {
                const category = categories.find(category => category.id === order.categoryId);
                return {
                    name: category.label,
                    unit_price: category.price.toFixed(2) + "€",
                    amount: order.amount,
                    total_price: (category.price * order.amount).toFixed(2) + "€"
                };
            }),
            total_net_price: (freeSeatOrder.totalPrice * 0.81).toFixed(2) + "€",
            tax_amount: "19%",
            total_price: freeSeatOrder.totalPrice,
            bank_information: ["Jon Doe", "Demo Bank", "IBAN: EN23 2133 2343 2343 2343"]
        });

        htmlPdf.create(html, {format: "A4"}).toFile(`temp/${orderId}.pdf`, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res.filename);
        });
    });
}
