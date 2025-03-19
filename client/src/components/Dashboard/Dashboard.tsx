import { Link } from "react-router-dom";
import Button from "../Button/Button";
import { useEffect, useState } from "react";
import likedHeart from "../../assets/heart-solid.svg";

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
}

function Dashboard() {
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [trendingPlaylists, setTrendingPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        async function getUserPlaylists() {
            setErrors({});
            setIsLoading(true);
            try {
                const response = await fetch(
                    "http://localhost:3000/api/v1/playlists/get-user-playlists",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            "Failed to fetch user playlists. Client side."
                    );
                } else {
                    setUserPlaylists(data?.data?.userPlaylists);
                }
            } catch (error: any) {
                setErrors({ userPlaylists: error?.message });
            } finally {
                setIsLoading(false);
            }
        }
        getUserPlaylists();
    }, []);

    useEffect(() => {
        async function getTrendingPlaylists() {
            setErrors({});
            setIsLoading(true);
            try {
                const response = await fetch(
                    "http://localhost:3000/api/v1/playlists/get-trending-playlists",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Failed to fetch trending playlists."
                    );
                } else {
                    setTrendingPlaylists(data?.data?.trendingPlaylists);
                }
            } catch (error: any) {
                setErrors({ trendingPlaylists: error?.message });
            } finally {
                setIsLoading(false);
            }
        }

        getTrendingPlaylists();
    }, []);

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular mt-5 min-h-screen w-full">
            <div className="flex justify-between items-center">
                <div className="flex-flex-col gap-2">
                    <h1 className="text-4xl text-[#ffc300]">
                        Welcome to Jockey
                    </h1>
                    <p className="text-xl text-[#003566]">
                        Create or join playlists and chat with others.
                    </p>
                </div>
                <Link to={"/playlists/create"}>
                    <Button
                        label="Create playlist"
                        type="button"
                        styling="rounded-full w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39] mb-8"
                    ></Button>
                </Link>
            </div>

            <div className="flex flex-col gap-2 mt-10">
                <h4 className="text-xl text-[#003566]">Your playlists</h4>
                {isLoading ? (
                    <div className="flex justify-center items-center">
                        Loading...
                    </div>
                ) : userPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full mt-5 rounded-xl">
                        {userPlaylists.map((playlist) => (
                            <Link
                                to={`/playlists/${playlist.name
                                    .split(" ")
                                    .join("-")}/${playlist.id}`}
                                key={playlist.id}
                            >
                                <div className="flex justify-between items-center gap-3 w-full h-15 bg-[#ffc300] hover:bg-[#aa8304] rounded-3xl px-4 py-4 text-white">
                                    <img
                                        src={playlist.coverImage}
                                        alt="playlist cover image"
                                        width={50}
                                        height={60}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <p className="text-nowrap text-xl text-white">
                                            {playlist.name}
                                        </p>
                                        <p className="text-nowrap text-white flex justify-end gap-1">
                                            {playlist.likes}{" "}
                                            <img
                                                src={likedHeart}
                                                alt="heart"
                                                width={20}
                                                height={20}
                                            />{" "}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center rounded-xl bg-gray-200 p-4">
                        You have not created any playlists yet.
                    </div>
                )}
            </div>
            {errors.userPlaylists && (
                <span className="text-red-500">{errors.userPlaylists}</span>
            )}

            <div className="flex flex-col gap-2 mt-10">
                <h4 className="text-xl text-[#003566]">
                    Trending public playlists right now
                </h4>
                {isLoading ? (
                    <div className="flex justify-center items-center">
                        Loading...
                    </div>
                ) : trendingPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full mt-5 rounded-xl">
                        {trendingPlaylists.map((playlist) => (
                            <Link
                                to={`/playlists/${playlist.name
                                    .split(" ")
                                    .join("-")}/${playlist.id}`}
                                key={playlist.id}
                            >
                                <div className="flex justify-between items-center gap-3 w-full h-15 bg-[#ffc300] hover:bg-[#aa8304] rounded-3xl px-4 py-4 text-white">
                                    <img
                                        src={playlist.coverImage}
                                        alt="playlist cover image"
                                        width={50}
                                        height={60}
                                    />
                                    <div className="flex  justify-between items-center w-full">
                                        <p className="text-nowrap text-xl text-white">
                                            {playlist.name}
                                        </p>
                                        <p className="text-nowrap text-white flex justify-end gap-1">
                                            {playlist.likes}{" "}
                                            <img
                                                src={likedHeart}
                                                alt="heart"
                                                width={20}
                                                height={20}
                                            />{" "}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center items-center rounded-xl bg-gray-200 p-4">
                        There are not any playlists created yet.
                    </div>
                )}
            </div>
            {errors.trendingPlaylists && (
                <span className="text-red-500">{errors.trendingPlaylists}</span>
            )}
        </div>
    );
}

export default Dashboard;
