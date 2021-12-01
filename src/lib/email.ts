import nodemailer from "nodemailer";

export const getEmailTransporter = async () => {
    let testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST ?? "smtp.ethereal.email",
        port: process.env.EMAIL_PORT ?? 587,
        secure: process.env.EMAIL_SECURE,
        auth: {
            user: process.env.EMAIL_USER ?? testAccount.user,
            pass: process.env.EMAIL_PASS ?? testAccount.pass
        }
    });
}
