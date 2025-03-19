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

const isMadeByUser = asyncHandler(async (request, response) => {
    try {
        const userId = request?.user?.id;

        const playlistId = parseInt(request.params["playlistId"]);

        if (!playlistId) {
            throw new ApiError(404, "Could not find playlist id.");
        }

        const playlist = await prisma.playlist.findFirst({
            where: {
                id: playlistId,
                creatorId: userId,
            },
        });

        let isMadeByUser = false;

        if (!playlist) {
            isMadeByUser = false;
        } else {
            isMadeByUser = true;
        }
        return response.status(200).json(
            new ApiResponse(
                200,
                {
                    success: true,
                    isMadeByUser: isMadeByUser,
                },
                "Successfully checked if made by user."
            )
        );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error.message));
    }
});

const getPlaylist = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request.params["playlistId"]);

        if (!playlistId) {
            throw new ApiError(500, "No playlist id found.");
        }

        const playlist = await prisma.playlist.findFirst({
            where: {
                id: playlistId,
            },
            include: {
                songs: true,
            },
        });

        const user = await prisma.user.findFirst({
            where: {
                id: playlist.creatorId,
            },
            select: {
                password: false,
                username: true,
            },
        });

        if (!playlist) {
            throw new ApiError(404, "Could not find playlist.");
        }

        return response.status(200).json(
            new ApiResponse(200, {
                success: true,
                playlist: playlist,
                username: user.username,
            })
        );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error.message));
    }
});

const addSongToPlaylist = asyncHandler(async (request, response) => {
    try {
        const { playlistId, title, artist, albumArtURL, youtubeId, duration } =
            request.body;

        const userId = request?.user?.id;

        if (!playlistId || !title || !youtubeId) {
            throw new ApiError(400, "Missing required fields.");
        }

        const playlist = await prisma.playlist.findFirst({
            where: {
                id: parseInt(playlistId),
                creatorId: parseInt(userId),
            },
        });

        if (!playlist) {
            throw new ApiError(
                403,
                "You dont have permission to add songs to this playlist."
            );
        }

        const lastSong = await prisma.playlistSong.findFirst({
            where: {
                playlistId: parseInt(playlistId),
            },
            orderBy: {
                position: "desc",
            },
        });

        const position = lastSong ? lastSong.position + 1 : 1;

        const newSong = await prisma.playlistSong.create({
            data: {
                playlistId: parseInt(playlistId),
                title: title,
                artist: artist,
                albumArtURL: albumArtURL,
                youtubeId: youtubeId,
                duration: duration,
                position: position,
                isPlayed: false,
                addedById: userId,
            },
        });

        if (!newSong) {
            throw new ApiError(500, "Failed to create new song.");
        }

        const updatedPlaylist = await prisma.playlist.findFirst({
            where: {
                id: parseInt(playlistId),
            },
            include: {
                songs: true,
            },
        });

        if (!updatedPlaylist) {
            throw new ApiError(500, "Could not retrieve playlist.");
        }

        return response.status(201).json(
            new ApiResponse(
                201,
                {
                    success: true,
                    songId: newSong.id,
                    addedById: userId,
                    updatedPlaylist: updatedPlaylist,
                },
                "Successfully added song to playlist."
            )
        );
    } catch (error) {
        console.error("Error adding song to playlist: ", error.message);
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { success: false },
                    "Failed to add song to playlist."
                )
            );
    }
});

const updateSongPlayStatus = asyncHandler(async (request, response) => {
    try {
        const { playlistId, youtubeId, isPlayed, lastPlayedAt } = request.body;

        const song = await prisma.playlistSong.update({
            where: {
                playlistId: playlistId,
                youtubeId: youtubeId,
            },
            data: {
                isPlayed: isPlayed,
                lastPlayedAt: lastPlayedAt,
            },
        });

        if (!song) {
            throw new ApiError(404, "Could not find the song in the playlist.");
        }

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Song play status updated."
                )
            );
    } catch (error) {
        console.error("Error updating song play status: ", error);

        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getTrendingPlaylists,
    isMadeByUser,
    getPlaylist,
    addSongToPlaylist,
    updateSongPlayStatus,
};
