import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "../../../../lib/prisma";
import {getUserByApiKey} from "../../../../constants/serverUtil";
import { compare } from 'bcryptjs';

export default NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "email",
            id: "login",
            credentials: {
                email: { label: "E-Mail", type: "email", },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                console.log("TEST");
                const user = await prisma.adminUser.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                const checkPassword = await compare(credentials.password, user.password);
                if (!checkPassword) return null;

                return user;
            }
        }),
        CredentialsProvider({
            name: "api",
            id: "apiKey",
            credentials: {
                key: { label: "Api-Key", type: "text", },
            },
            async authorize(credentials, req) {
                return await getUserByApiKey(credentials.key ?? req.headers["Api-Key"]);
            }
        })
    ],
})

