import path from "path";
import fs from "fs";
import bycrypt from "bcryptjs";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../lib/prisma";
import { Permission, PermissionSection, PermissionType } from "./interfaces";
import i18nConfig from "../../i18n";
import { Tickets } from "../store/reducers/orderReducer";

export function getStaticAssetFile(file, options = null) {
    let basePath = process.cwd();
    if (process.env.NODE_ENV === "production") {
        basePath = path.join(basePath, ".next/server/chunks");
    } else {
        basePath = path.join(basePath, "src/");
    }

    const filePath = path.join(basePath, `assets/${file}`);
    return fs.readFileSync(filePath, options);
}

export const hashPassword = async (password: string) => {
    return await bycrypt.hash(password, 10);
};

const checkPermissions = async (
    email: string,
    permission?: Permission
): Promise<boolean> => {
    if (
        permission === undefined ||
        permission.permission === PermissionSection.None
    )
        return true;
    const user = await prisma.adminUser.findUnique({
        where: {
            email: email
        }
    });
    const permissions =
        permission.permissionType === PermissionType.Write
            ? user.writeRights
            : user.readRights;
    return JSON.parse(permissions).includes(permission.permission);
};

export const getAdminServerSideProps = async (
    context,
    resultFunction?,
    permission?: Permission
) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: "/admin/login",
                permanent: false
            }
        };
    }
    if (!(await checkPermissions(session.user.email, permission))) {
        return {
            props: {
                permissionDenied: true
            }
        };
    }

    const result = resultFunction ? (await resultFunction(session)) ?? {} : {};
    if (!result.props) result.props = {};

    result.props.session = session;

    return result;
};

export const getUserByApiKey = async (apiKey) => {
    const [user, token] = apiKey.split(":"); //schema: username:token
    const result = await prisma.adminApiKeys.findMany({
        where: {
            user: {
                userName: user
            }
        },
        include: {
            user: true
        }
    });
    for (let entry of result) {
        if (await bycrypt.compare(token, entry.key)) return entry.user;
    }
    return null;
};

export const serverAuthenticate = async (
    req: NextApiRequest,
    res: NextApiResponse,
    permission?: Permission,
    sendResponse: boolean = true
) => {
    const apiKey =
        req.headers.authorization?.startsWith("Bearer") ?? null
            ? req.headers.authorization.replace("Bearer ", "")
            : null;
    let user;
    if (apiKey !== null) {
        user = await getUserByApiKey(apiKey);
    } else {
        user = (await getSession({ req }))?.user;
    }
    if (!user) {
        if (sendResponse) res.status(401).end("Unauthenticated");
        return null;
    }
    if (!(await checkPermissions(user.email, permission))) {
        if (sendResponse) res.status(401).end("Permission denied");
        return null;
    }
    return user;
};

export const formatPrice = (
    price: number,
    currency: string,
    locale: string
): string => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency
    }).format(price);
};

export const revalidateBuild = async (res: NextApiResponse, page: string | string[], addLocale: boolean = true) => {
    if (Array.isArray(page)) {
        await Promise.all(page.map(async (a) => await revalidateBuild(res, a)));
        return;
    }
    if (addLocale) {
        const pages = i18nConfig.locales
            .map(locale => (locale === i18nConfig.defaultLocale ? "" : "/" + locale) + page)
            .map(value => value !== "/" ? value.replace(/\/+$/, '') : "/");
        await Promise.all(pages.map(async (a) => await revalidateBuild(res, a, false)))
        return;
    }

    try {
        await res.revalidate(page);
    } catch (e) {
        console.log(e);
    }
};

export const revalidateEventPages = async (res, additionalPages: string[]) => {
    const events = await prisma.event.findMany();
    const eventPaths = events.map(event => `/seatselection/${event.id}`);

    await revalidateBuild(res, eventPaths.concat(additionalPages));
};

export const validateOrder = async (tickets: Tickets, eventId): Promise<boolean> => {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        },
        select: {
            seatType: true,
            categories: {
                select: {
                    categoryId: true,
                    maxAmount: true
                }
            }
        }
    });
    const seatIds = tickets.filter(ticket => ticket.seatId).map(ticket => ticket.seatId);
    if (event.seatType === "seatMap" && seatIds.length !== tickets.length) return false; // all tickets of event with seat reservation need a seatId
    if (seatIds.some((e, i, arr) => arr.indexOf(e) !== i)) return false; //duplicated seat ids in order

    // check seats not already occupied
    for (let seat of seatIds) {
        const seatIdValid = (await prisma.ticket.count({
            where: {
                seatId: seat,
                order: {
                    eventId: eventId
                }
            }
        })) === 0;
        if (!seatIdValid) return false; // we don't need to check the other seats, when one is already is invalid
    }

    const maxTicketAmounts = event.categories.reduce((dict, category) => {
        dict[category.categoryId] = category.maxAmount;
        return dict;
    }, {});
    const currentAmounts = (await prisma.ticket.groupBy({
        by: ["categoryId"],
        where: {
            order: {
                eventId: eventId
            },
            categoryId: {
                in: tickets.map(ticket => ticket.categoryId)
            }
        },
        _count: true
    })).reduce((dict, element) => {
        dict[element.categoryId] = element._count;
        return dict;
    }, {});
    for (let ticket of tickets) {
        currentAmounts[ticket.categoryId] += ticket.amount;
        if (isNaN(maxTicketAmounts[ticket.categoryId]) || !maxTicketAmounts[ticket.categoryId]) continue;
        if (currentAmounts[ticket.categoryId] > maxTicketAmounts[ticket.categoryId]) return false;
    }

    return true;
}
