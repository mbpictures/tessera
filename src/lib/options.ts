import prisma from "./prisma";
import { ShippingType } from "../store/factories/shipping/ShippingFactory";
import { PaymentType } from "../store/factories/payment/PaymentFactory";
import { Options } from "../constants/Constants";
import { revalidateBuild } from "../constants/serverUtil";
import { NextApiResponse } from "next";

const DEFAULT_OPTIONS: Partial<Record<Options, any>> = {
    "shop.title": "Ticket shop",
    "shop.payment-provider": Object.values(PaymentType),
    "shop.delivery": Object.values(ShippingType),
    "payment.information": [
        "Jon Doe",
        "Demo Bank",
        "IBAN: EN23 2133 2343 2343 2343"
    ],
    "payment.tax-amount": 19,
    "payment.fees.shipping": Object.values(ShippingType).reduce((group, value) => {
        group[value] = 0;
        return group;
    }, {}),
    "payment.fees.payment": Object.values(PaymentType).reduce((group, value) => {
        group[value] = 0;
        return group;
    }, {})
}

const updateNecessaryPages = async (key: Options, res?: NextApiResponse) => {
    if (!res) return;
    switch (key) {
        case Options.ShopSubtitle:
        case Options.ShopTitle:
            await revalidateBuild(res, "/");
            break;
        case Options.Delivery:
            await revalidateBuild(res, "/information");
            break;
        case Options.PaymentFeesPayment:
        case Options.PaymentProviders:
            await revalidateBuild(res, "/payment");
            break;
        case Options.Theme:
            const events = await prisma.event.findMany();
            const eventPaths = events.map(event => `/seatselection/${event.id}`);
            await revalidateBuild(res, eventPaths.concat(["/", "/information", "/payment", "/checkout"]))
            break;
        case Options.PaymentFeesShipping:
            await revalidateBuild(res, ["/payment", "/information"]);
    }
};

export const setOption = async (key: Options, value: any, res?: NextApiResponse) => {
    const valueSerialized = JSON.stringify({
        value
    });
    if (await prisma.option.findUnique({
        where: {
            key: key
        }
    })) {
        await prisma.option.update({
            where: {
                key: key
            },
            data: {
                value: valueSerialized
            }
        });
    } else {
        await prisma.option.create({
            data: {
                key: key,
                value: valueSerialized
            }
        });
    }

    await updateNecessaryPages(key, res);
};

export const getOption = async (key: Options): Promise<any> => {
    const option = await prisma.option.findUnique({
        where: {
            key: key
        }
    });
    if (option) {
        return JSON.parse(option.value).value;
    }

    if (key in DEFAULT_OPTIONS) return DEFAULT_OPTIONS[key];
    return null;
};

export const getAllOptions = async (): Promise<Record<Options, any>> => {
    let result: Partial<Record<Options, any>> = {};
    for(let option of Object.values(Options)) {
        result[option] = await getOption(option as Options);
    }
    return result as Record<Options, any>;
}
