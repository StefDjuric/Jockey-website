import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import circleImage from "../../assets/circle-solid.svg";
import likedHeartImage from "../../assets/heart-solid.svg";
import Button from "../Button/Button";
import playIcon from "../../assets/play-solid.svg";
import unlikedHeartImage from "../../assets/heart-regular.svg";
import plusIcon from "../../assets/plus-solid.svg";
import searchIcon from "../../assets/magnifying-glass-solid.svg";
import pauseIcon from "../../assets/pause-solid.svg";
import ButtonWithDropdownCard from "../ButtonWithDropdownCard/ButtonWithDropdownCard";
import PlaylistChat from "../PlaylistChat/PlaylistChat";
import { socket } from "../../utils/socket";
import xmarkIcon from "../../assets/xmark-solid.svg";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

declare global {
    interface PlaylistSong {
        id: number;
        playlistId: number;
        songId: number;
        addedById: number;
        addedBy: {
            id: number;
            username: string;
        };
        addedAt: Date;
        title: string;
        artist: string;
        album?: string;
        duration?: number;
        releaseDate?: Date;
        albumArtURL?: string;
        previerwURL?: string;
        spotifyId?: string;
        youtubeId?: string;
        position: number;
        isPlayed: boolean;
        lastPlayedAt?: Date;
        votes: number;
        createdAt?: Date;
    }

    interface Playlist {
        id: number;
        creatorId: number;
        name: string;
        description?: string;
        coverImage?: string;
        likes: number;
        isPublic: boolean;
        isCollaborative: boolean;
        shareCode?: string;
        createdAt?: Date;
        updatedAt?: Date;
        songs: Array<PlaylistSong>;
    }
}
interface YoutubeSearchResults {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    duration: string;
}

function Playlist() {
    const [playlist, setPlaylist] = useState<Playlist>();
    const [liked, setLiked] = useState(false);
    const [isMadeByUser, setIsMadeByUser] = useState<boolean>(false);
    const [isCollaborator, setIsCollaborator] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [playlistUsername, setPlaylistUsername] = useState<string>("");
    const playlistId = window.location.href.split("/")[5];
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(
        null
    );
    const [currentSongIdx, setCurrentSongIdx] = useState(-1);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<YoutubeSearchResults[]>(
        []
    );
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showPlayer, setShowPlayer] = useState<boolean>(false);
    const playerRef = useRef<any>(null);
    const [ytApiReady, setYtApiReady] = useState<boolean>(false);
    const playerContainerId = "youtube-player-container";
    const [playButtonIcon, setPlayButtonIcon] = useState(playIcon);
    const currentSongIdxRef = useRef(currentSongIdx);
    const currentVideoIdRef = useRef<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<{
        [key: string]: string;
    }>({});
    const navigate = useNavigate();

    const handleEditPlaylist = () => {
        navigate(
            `/edit-playlist/${playlist?.name.split(" ").join("-")}/${
                playlist?.id
            }`
        );
    };

    const handleDeletePlaylist = async () => {
        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/delete-playlist/${playlist?.id}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to delete playlist.");
            }

            setSuccessMessage({ general: data?.message });
            navigate("/dashboard", { replace: true });
        } catch (error: any) {
            setErrors({ general: error?.message });
        }
    };

    const handleInviteCollaborators = async () => {
        setSuccessMessage({});
        setErrors({});
        try {
            const response = await fetch(
                "https://jockey-website.onrender.com/api/v1/playlists/invite-collaborators",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        playlistId: playlistId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Failed to generate link for collaborators."
                );
            }

            const collaboratorLink = `${window.location.origin}/join-playlist?shareCode=${data?.data?.shareCode}`;

            window.navigator.clipboard.writeText(collaboratorLink);

            setSuccessMessage({
                general:
                    "Successfully copied collaborator link to clipboard. Share playlist with friends!",
            });
        } catch (error: any) {
            setErrors({ general: error?.message });
        }
    };

    const handleSharePlaylist = playlist?.isPublic
        ? () => {
              setSuccessMessage({});
              window.navigator.clipboard.writeText(window.location.href);
              setSuccessMessage({ general: "Copied link to clipboard." });
          }
        : async () => {
              try {
                  const response = await fetch(
                      `https://jockey-website.onrender.com/api/v1/playlists/get-share-code/${playlistId}`,
                      {
                          method: "GET",
                          credentials: "include",
                          headers: {
                              "Content-Type": "application/json",
                          },
                      }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                      throw new Error(
                          data?.message || "Failed to get playlist share code."
                      );
                  }

                  if (data?.data?.shareCode) {
                      window.navigator.clipboard.writeText(data.data.shareCode);
                      setSuccessMessage({
                          general:
                              "Share code copied to clipboard. Share playlist with friends.",
                      });
                  }
              } catch (error: any) {
                  setErrors({ general: error?.message });
              }
          };

    const ELLIPSIS_CREATOR_OPTIONS = [
        { label: "Edit Details", onClick: handleEditPlaylist },
        { label: "Delete Playlist", onClick: handleDeletePlaylist },
        { label: "Invite collaborators", onClick: handleInviteCollaborators },
        { label: "Share Playlist", onClick: handleSharePlaylist },
    ];

    const joinPlaylistRoom = () => {
        socket.emit("join_room", playlistId.toString());
    };

    useEffect(() => {
        joinPlaylistRoom();
    }, []);

    useEffect(() => {
        currentSongIdxRef.current = currentSongIdx;
    }, [currentSongIdx]);

    // Load youtube API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];

            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            // Player will be initialized when a song is played
            setYtApiReady(true);
        };

        if (window.YT && window.YT.Player) {
            setYtApiReady(true);
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Check if playlist is made by user
    useEffect(() => {
        async function isMadeByUser() {
            setErrors({});
            try {
                const response = await fetch(
                    `https://jockey-website.onrender.com/api/v1/playlists/is-made-by-user/${playlistId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.message);
                } else {
                    setIsMadeByUser(data?.data?.isMadeByUser);
                }
            } catch (error: any) {
                setErrors({ general: error?.message });
            }
        }

        isMadeByUser();
    }, []);

    // Check if user is collaborator on the playlist
    useEffect(() => {
        async function checkIfCollaborator() {
            setErrors({});
            try {
                const response = await fetch(
                    `https://jockey-website.onrender.com/api/v1/users/check-if-collaborator/${playlistId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            "Failed to check if user is collaborator."
                    );
                }

                setIsCollaborator(data?.data?.isCollaborator);
            } catch (error: any) {
                setErrors({ general: error?.message });
            }
        }

        checkIfCollaborator();
    }, []);

    async function getPlaylistSongs() {
        setErrors({});
        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/get-playlist-songs/${playlistId}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch playlist songs."
                );
            }

            if (data?.data?.playlist?.songs) {
                data.data.playlist.songs.sort(
                    (a: PlaylistSong, b: PlaylistSong) =>
                        a.position - b.position
                );
            }

            setPlaylist(data?.data?.playlist);
            setPlaylistUsername(data?.data?.username);

            if (currentlyPlaying && data?.data?.playlist?.songs) {
                const idx = data.data.playlist.songs.findIndex(
                    (song: PlaylistSong) => song.youtubeId === currentlyPlaying
                );
                if (idx !== -1) {
                    setCurrentSongIdx(idx);
                }
            }
        } catch (error: any) {
            console.error(error?.message);
            setErrors({ general: error?.message });
        }
    }

    useEffect(() => {
        if (currentlyPlaying && playlist?.songs) {
            const newIdx = playlist.songs.findIndex(
                (song) => song.youtubeId === currentlyPlaying
            );
            if (newIdx !== -1) {
                setCurrentSongIdx(newIdx);
            } else {
                console.warn(
                    `Could not find index for currently playing song: ${currentlyPlaying}`
                );
            }
        }
    }, [currentlyPlaying, playlist]);

    // Get playlist with the id
    useEffect(() => {
        getPlaylistSongs();
    }, [playlist?.likes, playlist?.songs]);

    // Check if playlist is liked
    useEffect(() => {
        async function checkIfLiked() {
            try {
                setErrors({});
                const response = await fetch(
                    `https://jockey-website.onrender.com/api/v1/playlists/check-if-liked/${playlistId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Failed to check if playlist is liked."
                    );
                }

                setLiked(data?.data?.isLiked);
            } catch (error: any) {
                console.log(error?.message);
                setErrors({ general: error?.message });
            }
        }
        checkIfLiked();
    }, []);

    const handleLike = async () => {
        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/like-playlist`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ playlistId }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to like the playlist."
                );
            }
            if (playlist?.likes !== undefined) {
                if (data?.data?.liked) {
                    playlist.likes += 1;
                } else {
                    playlist.likes -= 1;
                }
            }

            setLiked(data?.data?.liked);
        } catch (error: any) {
            console.error(error?.message);
            setErrors({ general: error?.message });
        }
    };

    const initPlayer = (videoId: string) => {
        if (!ytApiReady) {
            console.warn("Youtube API not yet ready.");
            return;
        }

        try {
            const container = document.getElementById(playerContainerId);

            if (!container) {
                console.error(
                    `Element with ID ${playerContainerId} not found.`
                );
                return;
            }

            if (playerRef.current) {
                try {
                    playerRef.current.loadVideoById(videoId);
                    currentVideoIdRef.current = videoId;
                    setCurrentlyPlaying(videoId);
                    return;
                } catch (error) {
                    console.error("Error loading video: ", error);
                }
            }

            container.innerHTML = "";

            const playerDiv = document.createElement("div");
            const uniquePlayerId = `youtube-player-${Date.now()}`;
            playerDiv.id = uniquePlayerId;
            container.appendChild(playerDiv);

            playerRef.current = new window.YT.Player(playerDiv.id, {
                height: "240",
                width: "100%",
                videoId: videoId,
                playerVars: {
                    playsinline: 1,
                    controls: 1,
                    autoplay: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: () => {
                        currentVideoIdRef.current = videoId;
                        setCurrentlyPlaying(videoId);
                    },
                    onStateChange: onPlayerStateChange,
                    onError: (event: any) =>
                        console.error("Player error:", event.data),
                },
            });

            setShowPlayer(true);
        } catch (error) {
            console.error("Error while initializing player: ", error);
        }
    };

    const onPlayerStateChange = (event: any) => {
        const eventVideoId = playerRef.current?.getVideoData()?.video_id;

        // Ignore events from previous players
        if (eventVideoId !== currentVideoIdRef.current) {
            return;
        }

        if (event.data === window.YT.PlayerState.ENDED) {
            playNextSong();
        } else if (event.data === window.YT.PlayerState.PLAYING) {
            setPlayButtonIcon(pauseIcon);
        } else if (event.data === window.YT.PlayerState.PAUSED) {
            setPlayButtonIcon(playIcon);
        }
    };

    const playSong = (youtubeId: string, songIdx?: number) => {
        if (!youtubeId) return;

        const idxToUse =
            songIdx !== undefined
                ? songIdx
                : playlist?.songs?.findIndex(
                      (song) => song.youtubeId === youtubeId
                  ) ?? -1;

        if (idxToUse !== -1) {
            setCurrentSongIdx(idxToUse);
        }

        if (playerRef.current && currentlyPlaying === youtubeId) {
            // if the same song is clicked again, just play/pause
            const state = playerRef.current.getPlayerState();

            if (state === 1) {
                // playing
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        } else {
            // Play new song
            currentVideoIdRef.current = youtubeId;
            initPlayer(youtubeId);
            setCurrentlyPlaying(youtubeId);

            if (playlist?.songs) {
                const updatedSongs = playlist.songs.map((song) => {
                    if (song.youtubeId === youtubeId) {
                        return {
                            ...song,
                            isPlayed: true,
                            lastPlayedAt: new Date(),
                        };
                    }
                    return song;
                });
                setPlaylist({ ...playlist, songs: updatedSongs });

                updateSongPlayStatus(youtubeId);
            }
        }
    };

    const playNextSong = () => {
        if (!playlist?.songs || playlist.songs.length === 0) {
            return;
        }

        const currentIdx = currentSongIdxRef.current;

        if (currentIdx >= 0 && currentIdx < playlist.songs.length - 1) {
            const nextIdx = currentIdx + 1;
            const nextSong = playlist.songs[nextIdx];

            if (nextSong.youtubeId) {
                playSong(nextSong.youtubeId, nextIdx);
            } else {
                console.warn("Next song doesnt have youtube id.");
            }
        } else if (currentIdx === playlist.songs.length - 1) {
            if (playlist.songs[0]?.youtubeId) {
                playSong(playlist.songs[0].youtubeId, 0);
            }
        } else {
            if (playlist.songs[0]?.youtubeId) {
                playSong(playlist.songs[0].youtubeId, 0);
            }
        }
    };

    const updateSongPlayStatus = async (youtubeId: string) => {
        setErrors({});
        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/update-song-status`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        playlistId,
                        youtubeId,
                        isPlayed: true,
                        lastPlayedAt: new Date(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to update song status."
                );
            }
        } catch (error: any) {
            setErrors({ general: error.message });
            console.error(error.message);
        }
    };

    const searchYoutube = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setErrors({});

        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/youtube/search?q=${encodeURIComponent(
                    searchQuery
                )}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to search for songs.");
            } else if (response.ok) {
                setSearchResults(data?.data?.items);
            }
        } catch (error: any) {
            console.error(error?.message);
            setErrors({ general: error?.message });
        } finally {
            setIsSearching(false);
        }
    };

    const addSongToPlaylist = async (result: YoutubeSearchResults) => {
        try {
            const durationInSeconds = convertDurationToSeconds(result.duration);

            const response = await fetch(
                "https://jockey-website.onrender.com/api/v1/playlists/add-song",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        playlistId: playlistId,
                        title: result.title,
                        artist: result.channelTitle,
                        albumArtURL: result.thumbnailUrl,
                        youtubeId: result.id,
                        duration: durationInSeconds,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to add song to playlist."
                );
            }

            if (data?.data?.updatedPlaylist) {
                if (data.data.updatedPlaylist?.songs) {
                    data.data.updatedPlaylist.songs.sort(
                        (a: PlaylistSong, b: PlaylistSong) =>
                            a.position - b.position
                    );
                }
                setPlaylist(data.data.updatedPlaylist);
            } else {
                getPlaylistSongs();
            }

            setSearchQuery("");

            setSearchResults([]);
        } catch (error: any) {
            console.error(error?.message);
            setErrors({ generals: error?.message });
        }
    };

    const convertDurationToSeconds = (durationString: string): number => {
        // Handle youtube PT format
        if (durationString.startsWith("PT")) {
            const timeString = durationString.substring(2);

            const hoursMatch = timeString.match(/(\d+)H/);
            const minutesMatch = timeString.match(/(\d+)M/);
            const secondsMatch = timeString.match(/(\d+)S/);

            const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
            const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
            const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;

            return hours * 3600 + minutes * 60 + seconds;
        }

        // Handle MM:SS format
        if (durationString.includes(":")) {
            const parts = durationString.split(":");

            if (parts.length === 2) {
                return parseInt(parts[0]) * 60 + parseInt(parts[1]);
            } else if (parts.length === 3) {
                return (
                    parseInt(parts[0]) * 3600 +
                    parseInt(parts[1]) * 60 +
                    parseInt(parts[2])
                );
            }
        }

        console.warn("Unrecognized duration format: ", durationString);
        return 0;
    };

    const formatDuration = (duration: number | undefined) => {
        if (!duration) return "--:--";

        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const removeSongFromPlaylist = async (event: any, songId: number) => {
        event.stopPropagation();
        try {
            console.log("Song id is: ", songId);
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/remove-song/${songId}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to remove song.");
            } else {
                setSuccessMessage({ general: "Successfully removed song." });
                const songIdx = playlist?.songs.findIndex(
                    (song) => song.id === songId
                );
                if (songIdx && songIdx > -1) playlist?.songs.splice(songIdx);
            }
        } catch (error: any) {
            setErrors({ general: error.message });
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular mt-5 min-h-screen w-full">
            <div className="flex flex-col gap-5">
                {/* Header section */}
                <div className="flex justify-items-start gap-5 items-center w-full">
                    <img
                        src={playlist?.coverImage}
                        alt="cover image"
                        width={100}
                        height={150}
                    />
                    <div className="flex-flex-col justify-center gap-2">
                        <p className="text-lg lg:text-xl text-nowrap">
                            {playlist?.isPublic
                                ? "Public Playlist"
                                : "Private playlist"}
                        </p>
                        <p className="text-2xl lg:text-6xl poppins-bold">
                            {playlist?.name}
                        </p>
                        <div className="flex gap-2 justify-between items-center">
                            <p className="text-lg lg:text-xl ">
                                Created by: {playlistUsername}{" "}
                            </p>
                            <img
                                className="inline"
                                src={circleImage}
                                alt="circle"
                                width={10}
                                height={10}
                            />

                            <div className="flex justify-between items-center gap-1">
                                <p className="text-lg lg:text-xl">
                                    {playlist?.likes}
                                </p>

                                <img
                                    src={likedHeartImage}
                                    alt="heart"
                                    width={25}
                                    height={25}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-0.5 bg-[#ffc300]"></div>
                {/* Youtube player */}
                <div
                    className={`w-full bg-gray-100 rounded-lg overflow-hidden ${
                        showPlayer ? "bg-gray-100" : ""
                    }`}
                    id={playerContainerId}
                    style={{ height: showPlayer ? "240px" : "0px" }}
                ></div>
                {/* Controls section */}
                <div className="flex justify-between items-center">
                    <div className="flex justify-between gap-3">
                        {playlist?.songs && playlist.songs.length > 0 && (
                            <Button
                                type="button"
                                icon={playButtonIcon}
                                onClick={() => {
                                    if (currentlyPlaying && playerRef.current) {
                                        const state =
                                            playerRef.current.getPlayerState();

                                        if (state === 1) {
                                            playerRef.current.pauseVideo();
                                            setPlayButtonIcon(playIcon);
                                        } else {
                                            playerRef.current.playVideo();
                                            setPlayButtonIcon(pauseIcon);
                                        }
                                    } else if (playlist.songs[0].youtubeId) {
                                        playSong(
                                            playlist.songs[0].youtubeId,
                                            0
                                        );
                                        setPlayButtonIcon(pauseIcon);
                                    }
                                }}
                                styling="rounded-full flex items-center justify-center w-15 h-15 lg:w-20 lg:h-20 bg-[#ffc300] hover:bg-[#aa8304] hover:cursor-pointer"
                            />
                        )}
                        <button
                            className="hover:cursor-pointer flex justify-center items-center"
                            type="button"
                            onClick={handleLike}
                        >
                            <img
                                src={
                                    liked ? likedHeartImage : unlikedHeartImage
                                }
                                alt="heart image"
                                width={40}
                                height={40}
                            />
                        </button>
                        {isMadeByUser ? (
                            <ButtonWithDropdownCard
                                data={ELLIPSIS_CREATOR_OPTIONS}
                            />
                        ) : (
                            <ButtonWithDropdownCard
                                data={[ELLIPSIS_CREATOR_OPTIONS[3]]}
                            />
                        )}
                    </div>

                    {/* <input
                        type="search"
                        name="search"
                        id="search"
                        placeholder="Search playlist..."
                        className="px-4 py-2 border-2 border-solid border-[#003566] rounded-lg w-[40%] lg:w-[30%]"
                    /> */}
                </div>
                {/* Playlist songs */}
                <div className="grid grid-cols-1 w-full mt-5 ">
                    {errors.general && (
                        <span className="text-red-500">{errors.general}</span>
                    )}
                    {successMessage.general && (
                        <span className="text-green-500">
                            {successMessage.general}
                        </span>
                    )}
                    <div className="flex justify-between items-center p-2 bg-gray-100">
                        <p className="text-sm lg:text-lg w-10">#</p>
                        <p className="text-sm lg:text-lg w-32 flex-grow">
                            Title
                        </p>
                        <p
                            className={`hidden sm:block text-sm lg:text-lg md:w-30`}
                        >
                            Album
                        </p>
                        <p className={` text-sm lg:text-lg w-25 md:w-34`}>
                            Added by
                        </p>
                        <p className="text-sm lg:text-lg w-20 sm:w-28 md:w-28">
                            Duration
                        </p>
                        {isCollaborator || isMadeByUser ? (
                            <p className="hidden sm:block text-sm lg:text-lg w-28 text-wrap">
                                Remove song
                            </p>
                        ) : (
                            ""
                        )}
                    </div>
                    {playlist?.songs ? (
                        playlist.songs.length > 0 ? (
                            playlist.songs.map((song, index) => (
                                <div
                                    className={`flex justify-between items-center p-2 hover:bg-[#ffc300] hover:cursor-pointer ${
                                        currentlyPlaying === song.youtubeId
                                            ? "bg-[#ffc300]"
                                            : ""
                                    }`}
                                    key={song.id}
                                    onClick={() =>
                                        song.youtubeId &&
                                        playSong(song.youtubeId, index)
                                    }
                                >
                                    <p className="text-sm lg:text-lg w-10">
                                        {song.position}
                                    </p>

                                    <div className="flex flex-col md:flex-row justify-start items-start md:items-center gap-3 w-32 flex-grow">
                                        <img
                                            src={song.albumArtURL}
                                            alt="album art"
                                            width={60}
                                            height={80}
                                            className="rounded-sm"
                                        />
                                        <div className="flex flex-col gap-2 w-32 md:w-48">
                                            <p
                                                className={`${
                                                    song.isPlayed
                                                        ? "text-[#003566]"
                                                        : ""
                                                } text-sm md:text-md poppins-medium`}
                                            >
                                                {song.title}
                                            </p>
                                            <p className="text-sm lg:text-lg text-[#003566]">
                                                {song.artist}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="md:text-md hidden sm:block text-sm text-[#003566] w-32 md:w-24 truncate">
                                        {song.album || "-"}
                                    </p>

                                    <p className="text-sm lg:text-lg text-[#003566] w-58 md:w-38 text-wrap">
                                        {song.addedBy.username}
                                    </p>

                                    <p className="text-sm lg:text-lg text-[#003566] w-28">
                                        {formatDuration(song.duration)}
                                    </p>
                                    {isCollaborator || isMadeByUser ? (
                                        <p className="text-lg text-[#003566] w-24 flex justify-center items-center">
                                            <Button
                                                type="button"
                                                icon={xmarkIcon}
                                                styling="bg-red-500 px-2 py-1 lg:px-4 lg:py-2 hover:cursor-pointer hover:bg-red-600"
                                                onClick={(event) =>
                                                    removeSongFromPlaylist(
                                                        event,
                                                        song.id
                                                    )
                                                }
                                            />
                                        </p>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center px-4 py-8 bg-gray-300">
                                <p className="text-xl">
                                    No songs found in this playlist
                                </p>{" "}
                            </div>
                        )
                    ) : (
                        <div className="flex justify-center items-center px-4 py-8 bg-gray-300 rounded-lg">
                            <p className="text-xl text-gray-500">Loading...</p>
                        </div>
                    )}
                </div>
                {(isMadeByUser || isCollaborator) && (
                    <div className="flex flex-col gap-5 justify-center mt-8 bg-gray-100 p-6 rounded-lg">
                        <p className="text-2xl text-[#ffc300]">
                            {playlist?.songs && playlist.songs.length > 0
                                ? "Add more songs to your playlist"
                                : "Let's find some songs for your playlist"}
                        </p>

                        <div className="flex gap-2">
                            <input
                                type="search"
                                name="search-songs"
                                id="search-songs"
                                value={searchQuery}
                                onChange={(event) =>
                                    setSearchQuery(event.target.value)
                                }
                                onKeyDown={(event: { key: any }) => {
                                    if (event.key === "Enter") {
                                        searchYoutube();
                                    }
                                }}
                                placeholder="Search songs for playlist..."
                                className="px-4 py-2 border-2 border-solid border-[#003566] rounded-lg flex-grow"
                            />
                            <Button
                                icon={searchIcon}
                                styling="px-4 py-3 bg-[#003566] text-white rounded-lg hover:bg-[#002b50] text-nowrap justify-center items-center"
                                type="button"
                                onClick={searchYoutube}
                                label="Search"
                            />
                        </div>

                        {isSearching ? (
                            <div className="flex justify-center items-center p-4">
                                <p>Searching...</p>
                            </div>
                        ) : (
                            searchResults.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-lg mb-2">
                                        Search results
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {searchResults.map((result) => (
                                            <div
                                                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                                                key={result.id}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={
                                                            result.thumbnailUrl
                                                        }
                                                        alt={result.title}
                                                        className="w-16 h-12 object-cover rounded"
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-xl">
                                                            {result.title}
                                                        </p>
                                                        <p className="text-xl text-gray-500">
                                                            {
                                                                result.channelTitle
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    icon={plusIcon}
                                                    styling="p-2 bg-[#ffc300] text-white rounded-full hover:bg-[#aa8304] cursor-pointer"
                                                    onClick={() =>
                                                        addSongToPlaylist(
                                                            result
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            <PlaylistChat playlistId={parseInt(playlistId)} />
        </div>
    );
}

export default Playlist;
