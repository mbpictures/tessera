import nodemailer from "nodemailer";

export const getEmailTransporter = async () => {
    if (process.env.EMAIL_PROVIDER) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_PROVIDER,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT ?? 587,
            secure: process.env.EMAIL_SECURE ?? false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    let testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: true,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
}
