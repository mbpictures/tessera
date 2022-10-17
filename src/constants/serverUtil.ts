import path from "path";
import fs from "fs";
import bycrypt from "bcryptjs";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../lib/prisma";
import { Permission, PermissionSection, PermissionType } from "./interfaces";
import i18nConfig from "../../i18n";
import { Ticket, Tickets } from "../store/reducers/orderReducer";
import { eventDateIsBookable } from "./util";
import { SeatMap } from "../components/seatselection/seatmap/SeatSelectionMap";

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
    const eventDates = await prisma.eventDate.findMany();
    const eventPaths = eventDates.map(eventDate => `/seatselection/${eventDate.id}`);

    await revalidateBuild(res, eventPaths.concat(additionalPages));
};

export const validateOrder = async (tickets: Tickets, eventDateId, reservationId): Promise<boolean> => {
    if (tickets.length === 0) return false;
    const eventDate = await prisma.eventDate.findUnique({
        where: {
            id: eventDateId
        },
        select: {
            event: {
                select: {
                    seatType: true,
                    categories: {
                        select: {
                            categoryId: true,
                            maxAmount: true
                        }
                    }
                }
            },
            date: true,
            ticketSaleEndDate: true,
            ticketSaleStartDate: true
        }
    });
    if (!eventDateIsBookable(eventDate)) return false;
    const seatIds = tickets.filter(ticket => ticket.seatId);
    if (eventDate.event.seatType === "seatMap" && seatIds.length !== tickets.length) return false; // all tickets of event with seat reservation need a seatId
    if (seatIds.map(ticket => ticket.seatId).some((e, i, arr) => arr.indexOf(e) !== i)) return false; //duplicated seat ids in order

    // check seats not already occupied
    const ticketsOccupied = await isTicketOccupied(eventDateId, tickets, reservationId);
    if (Object.values(ticketsOccupied).length > 0 && Object.values(ticketsOccupied).some(v => v)) return false;

    const maxTicketAmounts = eventDate.event.categories.reduce((dict, category) => {
        dict[category.categoryId] = category.maxAmount;
        return dict;
    }, {});

    let currentAmounts = await getCategoryTicketAmount(eventDateId, tickets, reservationId);
    for (let ticket of tickets) {
        currentAmounts[ticket.categoryId] += ticket.amount;
        if (isNaN(maxTicketAmounts[ticket.categoryId]) || !maxTicketAmounts[ticket.categoryId] || maxTicketAmounts[ticket.categoryId] === 0)
            continue; // category for this event isn't limited
        if (currentAmounts[ticket.categoryId] > maxTicketAmounts[ticket.categoryId]) return false;
    }

    return true;
}

export const getCategoryTicketAmount = async (eventDateId: number, tickets?: Tickets, reservationId?: string): Promise<Record<number, number>> => {
    const categoryIdFilter = tickets !== undefined ? {categoryId: {in: tickets?.map(ticket => ticket.categoryId).filter((value, index, self) => self.indexOf(value) === index)}} : {};
    const reservationIdFilter = reservationId !== undefined ? {reservationId: {not: reservationId}} : {};

    let databaseAmounts = await prisma.ticket.groupBy({
        by: ["categoryId"],
        where: {
            order: {
                eventDateId: eventDateId
            },
            ...categoryIdFilter
        },
        _count: true
    });
    databaseAmounts.push(...(await prisma.seatReservation.groupBy({
        by: ["categoryId"],
        where: {
            eventDateId: eventDateId,
            ...categoryIdFilter,
            ...reservationIdFilter,
            expiresAt: {
                gt: new Date()
            },
        },
        _count: true
    })));

    return databaseAmounts.reduce((dict, element) => {
        dict[element.categoryId] = element._count;
        return dict;
    }, {});
}

export const isTicketOccupied = async (eventDateId: number, tickets: Tickets | Ticket, reservationId?: string): Promise<Record<number, boolean>> => {
    if (!Array.isArray(tickets))
        tickets = [tickets];

    if (tickets.length === 0) return {};

    const reservations = await prisma.seatReservation.findMany({
        where: {
            eventDateId: eventDateId,
            expiresAt: {
                gt: new Date()
            },
            ...(reservationId && ({reservationId: {not: reservationId}}))
        }
    });
    const ticketsDb = await prisma.ticket.findMany({
        where: {
            order: {
                eventDateId: eventDateId
            }
        }
    });

    return tickets.reduce((group, ticket) => {
        group[ticket.seatId] = ticketsDb.some(t => t.seatId === ticket.seatId) ||
            reservations.some(reservation => reservation.seatId === ticket.seatId);
        return group;
    }, {});
}

export const getSeatMap = async (eventDateId, withOccupiedMarked): Promise<SeatMap> => {
    const event = await prisma.eventDate.findUnique({
        where: {
            id: eventDateId
        },
        select: {
            event: {
                select: {
                    seatMap: true,
                    seatType: true
                }
            }
        }
    });
    if (event.event.seatType !== "seatmap") throw new Error("Event not seatmap!");

    let seatMap: SeatMap = JSON.parse(event.event.seatMap.definition);
    if (withOccupiedMarked) {
        const occupies = await isTicketOccupied(eventDateId, seatMap.flat(2).map(seat => ({seatId: seat.id, amount: seat.amount, categoryId: seat.category})));
        seatMap = seatMap.map((row) =>
            row.map((seat) => {
                return {
                    ...seat,
                    occupied: occupies[seat.id]
                };
            })
        );
    }
    return seatMap;
}
