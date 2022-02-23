import prisma from "./prisma";
import { ShippingType } from "../store/factories/shipping/ShippingFactory";
import { PaymentType } from "../store/factories/payment/PaymentFactory";
import { Options } from "../constants/Constants";

const DEFAULT_OPTIONS: Partial<Record<Options, any>> = {
    "shop.title": "Ticket shop",
    "shop.payment-provider": Object.values(PaymentType),
    "shop.delivery": Object.values(ShippingType)
}

export const setOption = async (key: Options, value: any) => {
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
        return;
    }

    await prisma.option.create({
        data: {
            key: key,
            value: valueSerialized
        }
    });
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
