import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

import zod from "zod";

const prisma = new PrismaClient();
const zodUserSignUpSchema = zod.object({
    username: zod
        .string()
        .min(5, "Username must be at least 5 characters long."),
    email: zod.string().email("Invalid email address"),
    password: zod
        .string()
        .min(6, "Password must be at least 6 characters long."),
});

const zodUserLogInSchema = zod.object({
    emailOrUsername: zod.string(),
    password: zod.string(),
});

const registerUser = asyncHandler(async (request, response) => {
    try {
        const validationResult = zodUserSignUpSchema.safeParse(request.body);

        if (!validationResult.success) {
            throw new ApiError(
                400,
                validationResult.error.errors[0].message,
                validationResult.error.errors[0]
            );
        }

        const { username, email, password } = request.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { username: username }],
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new ApiError(409, "Email already in use.");
            } else {
                throw new ApiError(409, "Username already taken.");
            }
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const createdUser = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
            },
        });

        if (!createdUser) {
            throw new ApiError(
                500,
                "Something went wrong while registering an user."
            );
        }

        return response
            .status(201)
            .json(new ApiResponse(200, null, "User successfully registered."));
    } catch (error) {
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { error: "server", message: error.message },
                    error.message
                )
            );
    }
});

const loginUser = asyncHandler(async (request, response) => {
    try {
        const validationResult = zodUserLogInSchema.safeParse(request.body);

        if (!validationResult.success) {
            throw new ApiError(
                400,
                validationResult.error.errors[0].message,
                validationResult.error.errors[0]
            );
        }

        const { emailOrUsername, password } = request.body;

        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
            },
        });

        if (!user) {
            throw new ApiError(
                404,
                "No user with that email or username found."
            );
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            throw new ApiError(401, "Invalid password.");
        }

        const accessTokenPayload = {
            id: user.id,
            email: user.email,
            username: user.username,
        };

        const refreshTokenPayload = {
            id: user.id,
        };

        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION }
        );

        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
        );

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken: refreshToken,
                refreshTokenExpiration: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000
                ),
            },
        });

        return response
            .status(200)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 1000,
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Logged in successfully."
                )
            );
    } catch (error) {
        console.error("Log in error: ", error);
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { error: "server", message: error.message },
                    error.message
                )
            );
    }
});

export { registerUser, loginUser };
