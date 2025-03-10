import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

export const verifyJWT = asyncHandler(async (request, response, next) => {
    try {
        const token =
            request.cookies?.accessToken ||
            request.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request.");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await prisma.user.findFirst({
            where: {
                id: decodedToken?.id,
            },
            select: {
                password: false,
                refreshToken: false,
                refreshTokenExpiration: false,
                forgotPasswordToken: false,
                forgotPasswordTokenExpiration: false,
                id: true,
                username: true,
                email: true,
                avatar: true,
                lastLogin: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new ApiError(404, "User could not be found.");
        }

        request.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token.");
    }
});
