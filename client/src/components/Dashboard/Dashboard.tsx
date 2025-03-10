import { Link } from "react-router-dom";
import Button from "../Button/Button";
import { useEffect, useState } from "react";

interface Playlist {
    id: number;
    creatorId: number;
    name: string;
    description?: string;
    coverImage?: string;
    isPublic: boolean;
    isCollaborative: boolean;
    shareCode?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

function Dashboard() {
    const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
    const [trendingPlaylists, setTrendingPlaylists] = useState<Playlist[]>([]);

    useEffect(() => {
        setUserPlaylists([]);
        setTrendingPlaylists([]);
    }, []);

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular mt-5 min-h-screen w-full">
            <div className="flex justify-between items-center">
                <div className="flex-flex-col gap-2">
                    <h1 className="text-4xl text-[#ffc300]">
                        Welcome to Jockey
                    </h1>
                    <p className="txet-xl text-[#003566]">
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
                {userPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full mt-5 rounded-xl">
                        {userPlaylists.map((playlist) => (
                            <Link
                                to={`/playlists/${playlist.name.replace(
                                    " ",
                                    "-"
                                )}/${playlist.id}`}
                                key={playlist.id}
                            >
                                <div className="flex justify-around items-center">
                                    <img src={playlist.coverImage} alt="" />
                                    <p>{playlist.name}</p>
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

            <div className="flex flex-col gap-2 mt-10">
                <h4 className="text-xl text-[#003566]">
                    Trending playlists right now
                </h4>
                {trendingPlaylists.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-5 rounded-xl">
                        {trendingPlaylists.map((playlist) => (
                            <Link
                                to={`/playlists/${playlist.name.replace(
                                    " ",
                                    "-"
                                )}/${playlist.id}`}
                                key={playlist.id}
                            >
                                <div className="flex justify-around items-center">
                                    <img src={playlist.coverImage} alt="" />
                                    <p>{playlist.name}</p>
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
        </div>
    );
}

export default Dashboard;
