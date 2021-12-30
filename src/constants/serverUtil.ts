import path from "path";
import fs from "fs";
import bycrypt from 'bcryptjs';
import {getSession} from "next-auth/react";
import {NextApiRequest} from "next";
import prisma from "../lib/prisma";

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

export const getAdminServerSideProps = async (context, resultFunction?) => {
    const session = await getSession(context)

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        }
    }

    const result = resultFunction ? await resultFunction() : {};
    if (!result.props)
        result.props = {};

    result.props.session = session;

    return result;
}

export const getUserByApiKey = async (apiKey) => {
    const key = await hashPassword(apiKey);
    const user = await prisma.adminApiKeys.findUnique({
        where: {
            key: key
        },
        include: {
            user: true
        }
    });

    return user.user;
}

export const serverAuthenticate = async (req: NextApiRequest) => {
    const apiKey = req.headers.authorization?.startsWith("Bearer") ?? null ? req.headers.authorization.replace("Bearer ", "") : null;
    if (apiKey !== null) {
        return await getUserByApiKey(apiKey);
    }
    return (await getSession({req}))?.user;
}
