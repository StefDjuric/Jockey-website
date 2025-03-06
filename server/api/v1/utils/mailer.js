import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./apiError.js";

const prisma = new PrismaClient();

export const sendEmail = asyncHandler(async ({ email, userId }) => {
    try {
        const hashedToken = await bcryptjs.hash(userId.toString(), 10);

        const user = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                forgotPasswordToken: hashedToken,
                forgotPasswordTokenExpiration: new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                ),
            },
        });

        if (!user) {
            throw new ApiError(500, "Could not update forgot password token.");
        }

        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        const mailOptions = {
            from: "jockeytape@gmail.com",
            to: email,
            subject: "Reset your Jockey password",
            html: `<h1>Jockey.</h1>
            <p>Click <a href="http://localhost:3000/forgot-password/recovery?token=${hashedToken}">here</a> to reset your password.</p>`,
        };

        const mailResponse = await transporter.sendMail(mailOptions);

        return mailResponse;
    } catch (error) {
        console.error(error.message);
        throw new ApiError(500, "Could not send mail.", error);
    }
});
