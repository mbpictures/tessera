import path from "path";
import fs from "fs";
import bycrypt from 'bcryptjs';
import {getSession} from "next-auth/react";
import {NextApiRequest, NextApiResponse} from "next";
import prisma from "../lib/prisma";

export enum PermissionType {
    Read = "Read",
    Write = "Write"
}

export enum PermissionSection {
    None = "none",
    UserManagement = "UserManagement",
    EventManagement = "EventManagement",
    EventCategories = "EventCategories",
    EventSeatMaps = "EventSeatMaps",
    Orders = "Orders",
    OrderMarkAsPayed = "OrderMarkAsPayed"
}

export interface Permission {
    permissionType: PermissionType;
    permission: PermissionSection;
}

export function getStaticAssetFile(file, options = null) {
    let basePath = process.cwd();
    if (process.env.NODE_ENV === "production") {
        basePath = path.join(basePath, ".next/server/chunks");
    }
    else {
        basePath = path.join(basePath, "src/")
    }

    const filePath = path.join(basePath, `assets/${file}`);
    return fs.readFileSync(filePath, options);
}

export const hashPassword = async (password: string) => {
    return await bycrypt.hash(password, 10);
};

const checkPermissions = async (email: string, permission?: Permission): Promise<boolean> => {
    if (permission === undefined || permission.permission === PermissionSection.None) return true;
    const user = await prisma.adminUser.findUnique({
        where: {
            email: email
        }
    });
    const permissions = permission.permissionType === PermissionType.Write ? user.writeRights : user.readRights;
    return permissions.includes(permission.permission);
}

export const getAdminServerSideProps = async (context, resultFunction?, permission?: Permission) => {
    const session = await getSession(context)

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        }
    }
    if (!await checkPermissions(session.user.email, permission)) {
        return {
            props: {
                permissionDenied: true
            }
        }
    }

    const result = resultFunction ? (await resultFunction(session)) ?? {} : {};
    if (!result.props)
        result.props = {};

    result.props.session = session;

    return result;
}

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
    return result.find(async (entry) => await bycrypt.compare(token, entry.key))?.user;
}

export const serverAuthenticate = async (req: NextApiRequest, res: NextApiResponse, permission?: Permission, sendResponse: boolean = true) => {
    const apiKey = req.headers.authorization?.startsWith("Bearer") ?? null ? req.headers.authorization.replace("Bearer ", "") : null;
    let user;
    if (apiKey !== null) {
        user = await getUserByApiKey(apiKey);
    }
    else {
        user = (await getSession({req}))?.user;
    }
    if (!user) {
        if (sendResponse) res.status(401).end("Unauthenticated");
        return null;
    }
    if (!await checkPermissions(user.email, permission)) {
        if (sendResponse) res.status(401).end("Permission denied");
        return null;
    }
    return user;
}

export const formatPrice = (price: number, currency: string, locale: string): string => {
    return new Intl.NumberFormat(locale, {style: "currency", currency: currency}).format(price);
}
