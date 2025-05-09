import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { sendEmail } from "../utils/mailer.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

import zod from "zod";
import bcrypt from "bcryptjs";

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
                username: username.trim(),
                email: email.trim().toLowerCase(),
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
                sameSite: "None",
                maxAge: 60 * 60 * 1000,
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "None",
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

const sendMailToResetPassword = asyncHandler(async (request, response) => {
    const zodEmailSchema = zod.object({
        email: zod.string().email("Invalid email address."),
    });
    try {
        const validationResult = zodEmailSchema.safeParse(request.body);

        if (!validationResult.success) {
            throw new ApiError(
                400,
                validationResult.error.errors[0].message,
                validationResult.error.errors[0]
            );
        }

        const { email } = request.body;

        const user = await prisma.user.findFirst({
            where: {
                email: email,
            },
        });

        if (!user) {
            throw new ApiError(400, "Could not find user with this email.");
        }

        await sendEmail({ email: email, userId: user.id });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    `Mail sent successfully to ${email}.`
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, "", error.message));
    }
});

const recoverPassword = asyncHandler(async (request, response) => {
    const zodRecoverySchema = zod
        .object({
            password: zod
                .string()
                .min(6, "Password must be at least 6 characters long."),
            repeatPassword: zod.string(),
            token: zod.string(),
        })
        .refine((data) => data.password === data.repeatPassword, {
            message: "Passwords do not match.",
            path: ["repeatPassword"],
        });

    try {
        const validationResult = zodRecoverySchema.safeParse(request.body);

        if (!validationResult.success) {
            throw new ApiError(
                400,
                validationResult.error.errors[0].message,
                validationResult.error.errors[0]
            );
        }

        const { password, token } = request.body;

        const user = await prisma.user.findFirst({
            where: {
                forgotPasswordToken: token,
                forgotPasswordTokenExpiration: {
                    gt: new Date(Date.now()),
                },
            },
        });

        if (!user) {
            throw new ApiError(
                401,
                "Forgot password token expired. Please go to forgot password and enter your email again."
            );
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                password: hashedPassword,
                forgotPasswordToken: null,
                forgotPasswordTokenExpiration: null,
            },
        });

        return response
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { success: true },
                    "Successfully updated password."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, error, error.message));
    }
});

const logOut = asyncHandler(async (request, response) => {
    try {
        const user = await prisma.user.update({
            where: {
                id: request.user.id,
            },
            data: {
                refreshToken: null,
                refreshTokenExpiration: null,
            },
        });

        if (!user) {
            throw new ApiError(404, "Could not update user tokens.");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
        };

        return response
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Successfully logged out."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error.message));
    }
});

const uploadImage = asyncHandler(async (request, response) => {
    try {
        if (!request.file) {
            throw new ApiError(400, "No file uploaded");
        }

        const cloudinaryResult = await uploadToCloudinary(
            request.file.buffer,
            request.file.mimetype
        );

        if (!cloudinaryResult) {
            throw new ApiError(500, "Failed to upload to cloudinary.");
        }

        return response.status(200).json(
            new ApiResponse(
                200,
                {
                    success: true,
                    file: {
                        url: cloudinaryResult.url,
                        publicId: cloudinaryResult.public_id,
                    },
                },
                "Successfully uploaded image"
            )
        );
    } catch (error) {
        console.error("Upload error:", error);
        return response
            .status(error?.statusCode || 500)
            .json(
                new ApiResponse(
                    error?.statusCode || 500,
                    { success: false },
                    error?.message || "Internal server error."
                )
            );
    }
});

const checkAuthentication = asyncHandler(async (request, response) => {
    try {
        const accessToken =
            request.cookies?.accessToken ||
            request.header("Authorization")?.replace("Bearer", "");

        const refreshToken = request.cookies?.refreshToken;

        if (!accessToken) {
            if (refreshToken) {
                const decodedRefreshToken = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET
                );

                const user = await prisma.user.findUnique({
                    where: {
                        id: decodedRefreshToken.id,
                    },
                });

                if (!user) {
                    throw new ApiError(
                        404,
                        "No user found with this refresh token"
                    );
                }

                const accessTokenPayload = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                };

                if (
                    user &&
                    user.refreshToken === refreshToken &&
                    user.refreshTokenExpiration > new Date()
                ) {
                    const newAccessToken = jwt.sign(
                        accessTokenPayload,
                        process.env.ACCESS_TOKEN_SECRET,
                        {
                            expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
                        }
                    );

                    return response
                        .status(200)
                        .cookie("accessToken", newAccessToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "None",
                            maxAge: 60 * 60 * 1000,
                        })
                        .json(
                            new ApiResponse(
                                200,
                                { isLoggedIn: true },
                                "Refreshed accessToken."
                            )
                        );
                }

                return response
                    .status(401)
                    .clearCookie("accessToken")
                    .clearCookie("refreshToken")
                    .json(
                        new ApiResponse(
                            401,
                            {
                                isLoggedIn: false,
                            },
                            "No valid access and refresh token."
                        )
                    );
            } else {
                return response
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            { isLoggedIn: false },
                            "Not logged in."
                        )
                    );
            }
        } else {
            const decodedAccessToken = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );

            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { isLoggedIn: true, user: decodedAccessToken },
                        "Access token found. Logged in."
                    )
                );
        }
    } catch (error) {
        return response
            .status(401)
            .json(new ApiResponse(401, { isLoggedIn: false }, error.message))
            .clearCookie("accessToken")
            .clearCookie("refreshToken");
    }
});

const checkIfCollaborator = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request.params["playlistId"]);
        const userId = request.user?.id;

        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
            },
            select: {
                id: true,
                creatorId: true,
            },
        });

        if (!playlist) {
            throw new ApiError(404, "No playlist found.");
        }

        if (playlist.creatorId === userId) {
            return response.status(200).json(
                new ApiResponse(200, {
                    success: true,
                    isCollaborator: true,
                })
            );
        }

        const member = await prisma.playlistMember.findFirst({
            where: {
                userId: userId,
                playlistId: playlistId,
                role: "collaborator",
            },
        });

        return response.status(200).json(
            new ApiResponse(200, {
                success: true,
                isCollaborator: !!member,
                role: member?.role || null,
            })
        );
    } catch (error) {
        return response
            .status(error?.statusCode || 500)
            .json(
                new ApiResponse(
                    error?.statusCode || 500,
                    { success: false },
                    error?.message || "Internal server error."
                )
            );
    }
});

const checkIfMember = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request.params["playlistId"]);

        const userId = request.user.id;

        if (!playlistId) {
            throw new ApiError(404, "PlaylistId is missing as a parameter.");
        }

        if (!userId) {
            throw new ApiError(401, "Unauthorized access. Please log in.");
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
            },
            select: {
                id: true,
                creatorId: true,
            },
        });

        if (!playlist) {
            throw new ApiError(404, "Playlist not found.");
        }

        if (playlist.creatorId === userId) {
            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { isMember: true, success: true },
                        "Successfully entered the playlist."
                    )
                );
        }

        const member = await prisma.playlistMember.findFirst({
            where: {
                playlistId: playlistId,
                userId: userId,
            },
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, isMember: !!member },
                    "Successfully entered the playlist."
                )
            );
    } catch (error) {
        console.error(error?.message || "Internal server error.");
        return response
            .status(error?.statusCode || 500)
            .json(
                new ApiResponse(
                    error?.statusCode,
                    { success: false, isMember: false },
                    error?.message || "Internal server error."
                )
            );
    }
});

const updateUsername = asyncHandler(async (request, response) => {
    const usernameZodSchema = zod.object({
        username: zod
            .string()
            .min(5, "Username must be at least 5 characters long."),
    });

    try {
        const validationResult = usernameZodSchema.safeParse(request.body);

        if (!validationResult.success) {
            throw new ApiError(500, validationResult.error.errors[0].message);
        }

        const { username } = request.body;
        const userId = request.user.id;

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                username: username,
            },
        });

        if (!updatedUser) {
            throw new ApiError(500, "Failed to update username");
        }

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, updatedUsername: username },
                    `Successfully updated username to ${username}.`
                )
            );
    } catch (error) {
        console.error(error?.message || "Failed to update username.");
        return response
            .status(error?.statusCode || 500)
            .json(
                new ApiResponse(
                    error?.statusCode || 500,
                    { success: false, updatedUsername: null },
                    error?.message || "Failed to update username."
                )
            );
    }
});

const updateEmail = asyncHandler(async (request, response) => {
    try {
        const { email } = request.body;
        const userId = request.user.id;

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                email: email,
                refreshToken: null,
                refreshTokenExpiration: null,
            },
        });

        if (!updatedUser) {
            throw new ApiError(500, "Failed to update email.");
        }

        return response
            .status(200)
            .clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            .clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            .json(
                new ApiResponse(
                    200,
                    { success: true, updatedEmail: email },
                    `Successfully updated email to ${email}`
                )
            );
    } catch (error) {
        console.error(error?.message || "Failed to update email.");
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { success: false, updatedEmail: null },
                    error?.message || "Failed to update email."
                )
            );
    }
});

const updatePassword = asyncHandler(async (request, response) => {
    const zodUserChangePasswordSchema = zod
        .object({
            password: zod
                .string()
                .min(6, "Password must be at least 6 characters long."),
            confirmPassword: zod.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords must match.",
            path: ["confirmPassword"],
        });

    try {
        const validationResult = zodUserChangePasswordSchema.safeParse(
            request.body
        );

        if (!validationResult.success) {
            throw new ApiError(500, validationResult.error.errors[0].message);
        }

        const { password } = request.body;
        const userId = request.user.id;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        if (!updatedUser) {
            throw new ApiError(500, "Failed to update user password");
        }

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Successfully changed password."
                )
            );
    } catch (error) {
        console.error(error.message);
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error.message));
    }
});

const deleteProfile = asyncHandler(async (request, response) => {
    try {
        const userId = request.user.id;

        const deletedUser = await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        if (!deletedUser) {
            throw new ApiError(500, "Failed to delete profile.");
        }

        return response
            .status(200)
            .clearCookie("accessToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            .clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            })
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Successfully deleted profile."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { success: false },
                    error?.message || "Failed to delete profile."
                )
            );
    }
});

export {
    registerUser,
    loginUser,
    sendMailToResetPassword,
    recoverPassword,
    logOut,
    uploadImage,
    checkAuthentication,
    checkIfCollaborator,
    checkIfMember,
    updateUsername,
    updateEmail,
    updatePassword,
    deleteProfile,
};
