import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

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

        // Random shareCode
        const shareCode = Math.random()
            .toString(36)
            .substring(2, 10)
            .toUpperCase();

        const playlist = await prisma.playlist.create({
            data: {
                name: playlistName,
                description: playlistDescription,
                isPublic: isPublic,
                coverImage: coverImage,
                shareCode: shareCode,

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
                songs: {
                    include: {
                        addedBy: {
                            select: {
                                username: true,
                                id: true,
                            },
                        },
                    },
                },
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

const editPlaylist = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request?.params["playlistId"]);

        const { playlistType, playlistDescription, playlistName, coverImage } =
            request.body;

        const isPublic = playlistType.toLowerCase() === "public" ? true : false;

        if (!playlistName) {
            throw new ApiError(404, "Playlist name is required.");
        }

        await prisma.playlist.update({
            where: {
                id: playlistId,
            },
            data: {
                name: playlistName,
                description: playlistDescription,
                isPublic: isPublic,
                coverImage: coverImage,
            },
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Successfully updated playlist."
                )
            );
    } catch (error) {
        console.error(error?.message);
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

const deletePlaylist = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request?.params["playlistId"]);

        const deletedPlaylist = await prisma.playlist.delete({
            where: {
                id: playlistId,
            },
        });

        if (!deletedPlaylist) {
            throw new ApiError(500, "Failed to delete the playlist");
        }

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Successfully deleted the playlist."
                )
            );
    } catch (error) {
        console.error(error?.message);
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
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
                OR: [
                    { creatorId: userId },
                    {
                        members: {
                            some: {
                                userId: userId,
                                role: "collaborator",
                            },
                        },
                    },
                ],
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
                songs: {
                    include: {
                        addedBy: {
                            select: {
                                username: true,
                                id: true,
                            },
                        },
                    },
                },
                members: true,
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
            .status(error?.statusCode || "Internal server error.")
            .json(
                new ApiResponse(
                    error?.statusCode || "Internal server error.",
                    { success: false },
                    error?.message
                )
            );
    }
});

const updateSongPlayStatus = asyncHandler(async (request, response) => {
    try {
        const { playlistId, youtubeId, isPlayed, lastPlayedAt } = request.body;

        const song = await prisma.playlistSong.update({
            where: {
                playlistId: parseInt(playlistId),
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

const checkIfLiked = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request.params["playlistId"]);
        const userId = request?.user?.id;

        const like = await prisma.playlistLike.findFirst({
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
                    { success: true, isLiked: !!like },
                    "Successfully checked if playlist liked."
                )
            );
    } catch (error) {
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { success: false },
                    "Failed to check if liked."
                )
            );
    }
});

const likePlaylist = asyncHandler(async (request, response) => {
    try {
        let { playlistId } = request.body;

        playlistId = parseInt(playlistId);

        const userId = request?.user?.id;

        let existingLike;

        const result = await prisma.$transaction(async (prisma) => {
            existingLike = await prisma.playlistLike.findUnique({
                where: {
                    playlistId_userId: {
                        playlistId: playlistId,
                        userId: userId,
                    },
                },
            });

            if (existingLike) {
                await prisma.playlistLike.delete({
                    where: {
                        playlistId_userId: {
                            playlistId,
                            userId,
                        },
                    },
                });

                return prisma.playlist.update({
                    where: {
                        id: playlistId,
                    },
                    data: {
                        likes: {
                            decrement: 1,
                        },
                    },
                });
            } else {
                await prisma.playlistLike.create({
                    data: {
                        playlistId: playlistId,
                        userId: userId,
                    },
                });

                return await prisma.playlist.update({
                    where: {
                        id: playlistId,
                    },
                    data: {
                        likes: {
                            increment: 1,
                        },
                    },
                });
            }
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, liked: !existingLike },
                    "Successfully handled like."
                )
            );
    } catch (error) {
        console.error("Error handling like: ", error?.message);
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

const inviteCollaborators = asyncHandler(async (request, response) => {
    try {
        let { playlistId } = request.body;

        playlistId = parseInt(playlistId);

        const result = await prisma.$transaction(async (prisma) => {
            const playlist = await prisma.playlist.findUnique({
                where: {
                    id: playlistId,
                },
                select: {
                    shareCode: true,
                    id: true,
                },
            });

            if (!playlist) {
                throw new ApiError(404, "Playlist not found");
            }

            if (playlist.shareCode) {
                return playlist.shareCode;
            } else {
                const uniqueCode = Math.random()
                    .toString(36)
                    .substring(2, 10)
                    .toUpperCase();

                await prisma.playlist.update({
                    where: {
                        id: playlistId,
                    },
                    data: {
                        shareCode: uniqueCode,
                    },
                });

                return uniqueCode;
            }
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, shareCode: result },
                    "Successfully fetched share code."
                )
            );
    } catch (error) {
        console.error(error?.message);
        return response
            .status(500)
            .json(
                new ApiResponse(
                    500,
                    { success: false },
                    "Failed to generate link for collaborators"
                )
            );
    }
});

const getPlaylistByShareCode = asyncHandler(async (request, response) => {
    try {
        const shareCode = request.query["shareCode"];

        if (!shareCode) {
            throw new ApiError(404, "searchCode not found as parameter.");
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                shareCode: shareCode,
            },
            select: {
                creator: true,
                name: true,
                coverImage: true,
            },
        });

        if (!playlist) {
            throw new ApiError(404, "No playlist with this share code found.");
        }

        return response.status(200).json(
            new ApiResponse(
                200,
                {
                    success: true,
                    playlist: {
                        name: playlist.name,
                        creatorName: playlist.creator.username,
                        coverImage: playlist.coverImage,
                    },
                },
                "Successfully fetched playlist data."
            )
        );
    } catch (error) {
        return response
            .status(500)
            .json(new ApiResponse(500, { success: false }, error?.message));
    }
});

const joinPlaylist = asyncHandler(async (request, response) => {
    try {
        const { shareCode, role } = request.body;
        const userId = request?.user?.id || null;

        if (!userId) {
            throw new ApiError(401, "User not authenticated.");
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                shareCode: shareCode,
            },
            select: {
                id: true,
                name: true,
                creatorId: true,
                members: true,
            },
        });

        if (!playlist) {
            throw new ApiError(404, "Playlist not found.");
        }

        if (playlist.creatorId === userId) {
            throw new ApiError(
                400,
                `You can not join as a ${role} if you are the creator of the playlist.`
            );
        }
        // Check if is already member
        else if (
            playlist.members.find((member) => {
                return member.userId === userId ? true : false;
            })
        ) {
            throw new ApiError(
                400,
                "You are already a member of this playlist."
            );
        }
        if (role === "collaborator") {
            await prisma.playlistMember.create({
                data: {
                    playlistId: playlist.id,
                    userId: userId,
                    role: role,
                },
            });

            await prisma.playlistActivity.create({
                data: {
                    playlistId: playlist.id,
                    userId: userId,
                    actionType: "JOIN",
                },
            });
        }

        return response.status(201).json(
            new ApiResponse(
                201,
                {
                    success: true,
                    playlistId: playlist.id,
                    playlistName: playlist.name,
                    role: role,
                },
                `Successfully joined the playlist as ${role}.`
            )
        );
    } catch (error) {
        return response
            .status(error?.statusCode)
            .json(
                new ApiResponse(
                    error?.statusCode,
                    { success: false },
                    error?.message
                )
            );
    }
});

const joinPrivatePlaylist = asyncHandler(async (request, response) => {
    try {
        const { shareCode, playlistId } = request.body;
        const userId = request.user.id;

        if (!shareCode) {
            throw new ApiError(404, "Share code is required.");
        }

        if (!userId) {
            throw new ApiError(401, "Unauthorized user. Please log in");
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                shareCode: shareCode,
                id: playlistId,
            },
            select: {
                id: true,
            },
        });

        if (!playlist) {
            throw new ApiError(400, "Share code is wrong. Please try again.");
        }

        await prisma.playlistMember.create({
            data: {
                playlistId: playlist.id,
                userId: userId,
                role: "member",
            },
        });

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true },
                    "Successfully joined the playlist."
                )
            );
    } catch (error) {
        console.error(error?.message);
        return response
            .status(error.statusCode)
            .json(
                new ApiResponse(
                    error.statusCode,
                    { success: false },
                    error.message || "Failed to join playlist."
                )
            );
    }
});

const getPlaylistShareCode = asyncHandler(async (request, response) => {
    try {
        const playlistId = parseInt(request.params["playlistId"]);

        if (!playlistId) {
            throw new ApiError(404, "PlaylistId parameter not found.");
        }

        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
            },
            select: {
                shareCode: true,
            },
        });

        if (!playlist) {
            throw new ApiError(404, "Playlist not found.");
        }

        return response
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { success: true, shareCode: playlist.shareCode },
                    "Successfully fetched share code."
                )
            );
    } catch (error) {
        console.error(error?.message || "Internal server error");
        return response
            .status(error?.statusCode || 500)
            .json(
                new ApiResponse(
                    error?.statusCode || 500,
                    { success: false, shareCode: null },
                    error?.message || "Internal server error."
                )
            );
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getTrendingPlaylists,
    isMadeByUser,
    getPlaylist,
    editPlaylist,
    addSongToPlaylist,
    updateSongPlayStatus,
    likePlaylist,
    checkIfLiked,
    deletePlaylist,
    inviteCollaborators,
    getPlaylistByShareCode,
    joinPlaylist,
    joinPrivatePlaylist,
    getPlaylistShareCode,
};
