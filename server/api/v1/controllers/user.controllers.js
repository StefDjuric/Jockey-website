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
                OR: [{ email }, { username }],
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
        throw new ApiError(500, error.message, error);
    }
});

export { registerUser };
