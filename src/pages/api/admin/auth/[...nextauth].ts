import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../../lib/prisma";
import { getUserByApiKey } from "../../../../constants/serverUtil";
import { compare } from "bcryptjs";

export default NextAuth({
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "email",
            id: "login",
            credentials: {
                email: { label: "E-Mail", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const user = await prisma.adminUser.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                const checkPassword = await compare(
                    credentials.password,
                    user.password
                );
                if (!checkPassword) return null;

                return {
                    name: user.userName,
                    email: user.email
                };
            }
        }),
        CredentialsProvider({
            name: "api",
            id: "apiKey",
            credentials: {
                key: { label: "Api-Key", type: "text" }
            },
            async authorize(credentials, req) {
                const user = await getUserByApiKey(
                  credentials.key ?? req.headers["Api-Key"]
                );
                if (!user) return null;
                return {
                    name: user.userName,
                    email: user.email
                }
            }
        })
    ]
});
