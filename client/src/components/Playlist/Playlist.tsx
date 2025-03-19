import { useEffect, useRef, useState } from "react";
import circleImage from "../../assets/circle-solid.svg";
import likedHeartImage from "../../assets/heart-solid.svg";
import Button from "../Button/Button";
import playButton from "../../assets/play-solid.svg";
import unlikedHeartImage from "../../assets/heart-regular.svg";
import plusIcon from "../../assets/plus-solid.svg";
import searchIcon from "../../assets/magnifying-glass-solid.svg";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

interface PlaylistSong {
    id: number;
    playlistId: number;
    songId: number;
    addedById: number;
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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [playlistUsername, setPlaylistUsername] = useState<string>("");
    const playlistId = window.location.href.split("/")[5];
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<YoutubeSearchResults[]>(
        []
    );
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [showPlayer, setShowPlayer] = useState<boolean>(false);
    const playerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);

    //Load youtube API
    useEffect(() => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];

        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            // Player will be initialized when a song is played
        };

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
                    `http://localhost:3000/api/v1/playlists/is-made-by-user/${playlistId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                } else {
                    setIsMadeByUser(data?.data?.isMadeByUser);
                }
            } catch (error: any) {
                setErrors({ general: error?.message });
            }
        }

        isMadeByUser();
    }, []);

    async function getPlaylistSongs() {
        setErrors({});
        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/playlists/get-playlist-songs/${playlistId}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            console.log("Get Playlist songs API response: ", data);
            console.log("Playlist data:", data?.data?.playlist);
            console.log("Songs data:", data?.data?.playlist?.songs);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to fetch playlist songs."
                );
            }

            setPlaylist(data?.data?.playlist);
            setPlaylistUsername(data?.data?.username);
        } catch (error: any) {
            console.error(error?.message);
            setErrors({ general: error?.message });
        }
    }

    // Get playlist with the id
    useEffect(() => {
        getPlaylistSongs();
    }, []);

    const handleLike = () => {
        setLiked(!liked);
    };

    const initPlayer = (videoId: string) => {
        if (window.YT && window.YT.Player) {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        }

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
            height: "240",
            width: "100%",
            videoId: videoId,
            playerVars: {
                playsinline: 1,
                controls: 1,
                autoplay: 1,
            },
            events: {
                onStateChange: onPlayerStateChange,
            },
        });

        setShowPlayer(true);
        setCurrentlyPlaying(videoId);
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === window.YT.PlayerState.ENDED) {
            playNextSong();
        }
    };

    const playSong = (youtubeId: string) => {
        if (!youtubeId) return;

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
            initPlayer(youtubeId);

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
        if (!playlist?.songs || playlist.songs.length === 0) return;

        const currentIdx = playlist.songs.findIndex(
            (song) => song.youtubeId === currentlyPlaying
        );

        if (currentIdx >= 0 && currentIdx < playlist.songs.length - 1) {
            const nextSong = playlist.songs[currentIdx + 1];

            if (nextSong.youtubeId) {
                playSong(nextSong.youtubeId);
            }
        }
    };

    const updateSongPlayStatus = async (youtubeId: string) => {
        setErrors({});
        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/playlists/update-song-status`,
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
                `http://localhost:3000/api/v1/youtube/search?q=${encodeURIComponent(
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
                console.log("Raw search results: ", data?.data?.items);
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
                "http://localhost:3000/api/v1/playlists/add-song",
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

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular mt-5 min-h-screen w-full">
            <div className="flex flex-col gap-5">
                {/* Header section */}
                <div className="flex justify-items-start gap-5 items-center w-full">
                    <img
                        src={playlist?.coverImage}
                        alt="cover image"
                        width={50}
                        height={60}
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
                                    width={20}
                                    height={20}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-0.5 bg-[#ffc300]"></div>

                {/* Youtube player */}
                {showPlayer && (
                    <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
                        <div
                            ref={playerContainerRef}
                            id="youtube-player"
                            className="w-full h-64"
                        ></div>
                    </div>
                )}

                {/* Controls section */}
                <div className="flex justify-between items-center">
                    <div className="flex justify-between gap-3">
                        {playlist?.songs && playlist.songs.length > 0 && (
                            <Button
                                type="button"
                                icon={playButton}
                                onClick={() => {
                                    if (playlist.songs[0].youtubeId) {
                                        playSong(playlist.songs[0].youtubeId);
                                    }
                                }}
                                styling="rounded-full flex items-center justify-center w-15 h-15 lg:w-20 lg:h-20 bg-[#ffc300] hover:bg-[#aa8304] hover:cursor-pointer"
                            />
                        )}
                        <Button
                            icon={liked ? likedHeartImage : unlikedHeartImage}
                            styling="w-15 h-15 hover:cursor-pointer"
                            type="button"
                            onClick={handleLike}
                        />
                    </div>

                    <input
                        type="search"
                        name="search"
                        id="search"
                        placeholder="Search songs..."
                        className="px-4 py-2 border-2 border-solid border-[#003566] rounded-lg"
                    />
                </div>

                {/* Playlist songs */}
                <div className="grid grid-cols-1 w-full mt-5 ">
                    {errors.general && (
                        <span className="text-red-500">{errors.general}</span>
                    )}
                    <div className="flex justify-between items-center p-2 bg-gray-100">
                        <p className="text-lg w-10">#</p>
                        <p className="text-lg flex-grow">Title</p>
                        <p className="text-lg w-32 md:w-48">Album</p>
                        <p className="text-lg w-24 md:w-28">Added by</p>
                        <p className="text-lg w-24">Duration</p>
                    </div>
                    {playlist?.songs ? (
                        playlist.songs.length > 0 ? (
                            playlist.songs.map((song) => (
                                <div
                                    className={`flex justify-between items-center p-2 hover:bg-[#ffc300] hover:cursor-pointer ${
                                        currentlyPlaying === song.youtubeId
                                            ? "bg-amber-200"
                                            : ""
                                    }`}
                                    key={song.id}
                                    onClick={() =>
                                        song.youtubeId &&
                                        playSong(song.youtubeId)
                                    }
                                >
                                    <p className="text-lg w-10">
                                        {song.position}
                                    </p>

                                    <div className="flex justify-start items-center gap-3 flex-grow">
                                        <img
                                            src={song.albumArtURL}
                                            alt="album art"
                                            width={40}
                                            height={40}
                                            className="rounded-sm"
                                        />
                                        <div className="flex flex-col gap-2 w-32">
                                            <p
                                                className={`${
                                                    song.isPlayed
                                                        ? "text-[#ffc300]"
                                                        : "text-[#003566]"
                                                } text-lg poppins-medium`}
                                            >
                                                {song.title}
                                            </p>
                                            <p className="text-gray-500">
                                                {song.artist}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-lg text-gray-300 w-30 md:40  truncate">
                                        {song.album || "-"}
                                    </p>

                                    <p className="text-lg text-gray-300 w-24 md:w-28">
                                        {song.addedById}
                                    </p>

                                    <p className="text-lg text-gray-300">
                                        {formatDuration(song.duration)}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="flex justify-center items-center px-4 py-8 3g-gray-500">
                                <p className="text-xl">
                                    No songs found in this playlist
                                </p>{" "}
                            </div>
                        )
                    ) : (
                        <div className="flex justify-center items-center px-4 py-8 bg-gray-30 rounded-lg">
                            <p className="text-xl text-gray-500">Loading...</p>
                        </div>
                    )}
                </div>

                {isMadeByUser && (
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
                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
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
        </div>
    );
}

export default Playlist;
