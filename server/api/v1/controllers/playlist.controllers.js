import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

const createPlaylist = asyncHandler(async (request, response) => {
    try {
        const { playlistType, playlistDescription, playlistName, coverImage } =
            request.body;

        const isPublic = playlistType.toLowerCase() === "public" ? true : false;

        if (!playlistName) {
            throw new ApiError(400, "Playlist name is required.");
        }

        const user = await prisma.user.findFirst({
            where: {
                id: request?.user?.id,
            },
        });

        if (!user) {
            throw new ApiError(404, "Could not find user with the token id.");
        }

        const playlist = await prisma.playlist.create({
            data: {
                name: playlistName,
                description: playlistDescription,
                isPublic: isPublic,
                coverImage: coverImage,

                creator: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        if (!playlist) {
            throw new ApiError(500, "Could not create playlist.");
        }

        return response
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    { success: true },
                    "Successfully created a playlist."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

const getUserPlaylists = asyncHandler(async (request, response) => {
    try {
        const userId = request?.user?.id;

        const userPlaylists = await prisma.playlist.findMany({
            where: {
                creatorId: userId,
            },
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, userPlaylists: userPlaylists },
                    "Successfully fetched user playlists."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

const getTrendingPlaylists = asyncHandler(async (request, response) => {
    try {
        const dateThreshold = new Date();

        // sets the date threshold to seven days ago
        dateThreshold.setDate(dateThreshold.getDate() - 7);

        const trendingPlaylists = await prisma.playlist.findMany({
            where: {
                updatedAt: {
                    gte: dateThreshold,
                },
                isPublic: true,
            },
            orderBy: {
                likes: "desc",
            },
            take: 6, // Limit to six playlists
            include: {
                creator: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        songs: true,
                        members: true,
                    },
                },
            },
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { trendingPlaylists: trendingPlaylists, success: true },
                    "Successfully fetched trending playlists."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

export { createPlaylist, getUserPlaylists, getTrendingPlaylists };
