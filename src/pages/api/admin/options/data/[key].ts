import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../../constants/interfaces";
import { getOptionData, setOptionData } from "../../../../../lib/options";
import { Options } from "../../../../../constants/Constants";
import { IncomingForm } from 'formidable';
import fs from "fs";
import unescape from "lodash/unescape";
import { faker } from "@faker-js/faker";
import ejs from "ejs";
import { formatPrice } from "../../../../../constants/util";
import { generateTicket } from "../../../../../lib/ticket";

const renderEjs = (template, data) => {
    const result = ejs.render(unescape(template.toString()), data);
    const encoder = new TextEncoder();
    return Buffer.from(encoder.encode(result));
}

const templatePreviewFill = {
    "template.invoice": async (buffer: Buffer) => {
        const template = buffer.toString();
        const date = new Date();
        return renderEjs(template, {
            invoice_number: 1,
            creation_date: `${date.getDate()}. ${date.getMonth()} ${date.getFullYear()}`,
            receiver: [
                faker.name.firstName() + " " + faker.name.lastName(),
                faker.address.streetAddress(),
                faker.address.zipCode("#####") + " " + faker.address.city()
            ],
            products: [{
                name: "Demo Category",
                unit_price: formatPrice(
                    20.99,
                    "USD"
                ),
                amount: 1,
                total_price: formatPrice(
                    20.99,
                    "USD"
                )
            }],
            total_net_price: formatPrice(
                20.99 * (1 - (19 / 100)),
                "USD"
            ),
            tax_amount: `${19}%`,
            total_price: formatPrice(
                20.99,
                "USD"
            ),
            bank_information: [
                "Demo Bank",
                "IBAN: AB12 3456 7891 2345 1234"
            ],
            purpose: "AAAAAAA"
        })
    },
    "template.confirm-email": async (buffer: Buffer) => {
        const template = buffer.toString();
        return renderEjs(template, {
            customerName: faker.name.firstName() + " " + faker.name.lastName(),
            containsTickets: true,
            containsInvoice: true,
            googleWallet: {
                allTicketsLink: "https://google.com",
                ticketLinks: ["https://google.com"]
            }
        })
    },
    "template.ticket": async (buffer: Buffer, locale) => {
        const result = await generateTicket(buffer, {
            seatInformation: "Demo Category",
            price: 20.99,
            name: faker.name.firstName() + " " + faker.name.lastName(),
            locale: locale ?? "en-GB",
            currency: "USD",
            date: new Date()
        }, "Demo Event", "00000-0000000-000000000000000", true);
        return Buffer.from(result);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Options,
        permissionType: PermissionType.Read
    });
    if (!user) return;

    const { key, demo, locale } = req.query;
    const optionsKey = key as Options;
    if (!key) {
        res.status(400).end("Please provide an option key!");
        return;
    }

    if (req.method === "GET") {
        const option = await getOptionData(optionsKey);
        let data = option.data;
        if (demo === "true") {
            data = await templatePreviewFill[optionsKey](data, locale);
        }
        console.log(data);
        res.setHeader("Content-Type", option.type);
        res.status(200).send(data);
        return;
    }

    if (req.method === "POST") {
        const data: {fields, files} = await new Promise((resolve, reject) => {
            const form = new IncomingForm();
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });
        const file = data.files.file;
        const fileData = await fs.promises.readFile(file.filepath);
        await setOptionData(optionsKey, fileData, file.mimetype);
        res.status(200).end("Updated");
        return;
    }

    res.status(400).end("Method not allowed");
}

export const config = {
    api: {
        bodyParser: false,
    }
};
