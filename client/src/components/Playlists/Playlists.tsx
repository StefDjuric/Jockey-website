import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import likedHeartIcon from "../../assets/heart-solid.svg";
import lockIcon from "../../assets/lock-solid.svg";
import Modal from "../Modal/Modal";
import searchIcon from "../../assets/magnifying-glass-solid.svg";

function Playlists() {
    const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
    const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showModal, setShowModal] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
        null
    );
    const [sortBy, setSortBy] = useState<string>("RECENT");
    const navigate = useNavigate();

    const fetchAllPlaylists = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/get-all-playlists?sortBy=${sortBy}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to fetch playlists.");
            } else {
                setAllPlaylists(data?.data?.playlists);
                setFilteredPlaylists(data.data.playlists);
            }
        } catch (error: any) {
            setErrors({ playlists: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrivatePlaylistClick = async (playlistId: number) => {
        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/users/is-member-already/${playlistId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!data?.data?.isMember) {
                setSelectedPlaylistId(playlistId);
                setShowModal(true);
            } else {
                setShowModal(false);
                const playlist = allPlaylists.find(
                    (playlist) => playlist.id === playlistId
                );
                if (playlist) {
                    navigate(
                        `/playlists/${playlist.name
                            .split(" ")
                            .join("-")}/${playlistId}`
                    );
                }
            }
        } catch (error: any) {
            setErrors({ playlists: error.message });
        }
    };

    useEffect(() => {
        fetchAllPlaylists();
    }, [sortBy]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredPlaylists(allPlaylists);
        } else {
            const filtered = allPlaylists.filter((playlist) =>
                playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredPlaylists(filtered);
        }
    }, [searchTerm, allPlaylists]);

    const handleSortChange = (sortBy: string) => {
        setSortBy(sortBy);
        navigate(`/playlists?sortBy=${sortBy}`);
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular mt-5 min-h-screen w-full">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl text-[#ffc300]">
                        Discover Playlists
                    </h1>
                    <p className="text-xl text-[#003566]">
                        Find and join playlists that match your taste.
                    </p>
                </div>
                <Link to={"/playlists/create"}>
                    <Button
                        label="Create playlist"
                        type="button"
                        styling="rounded-full w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39] mb-8"
                    />
                </Link>
            </div>

            {/* Filters section */}
            <div className="mt-10 mb-4">
                <h4 className="text-xl text-[#003566] mb-4">Filter by</h4>
                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        label="Recently Created"
                        styling="px-4 py-2 rounded-full bg-[#003566] text-white hover:bg-[#192a39] hover:cursor-pointer"
                        onClick={() => handleSortChange("RECENT")}
                    />
                    <Button
                        type="button"
                        label="Most popular"
                        styling="px-4 py-2 rounded-full bg-[#003566] text-white hover:bg-[#192a39] hover:cursor-pointer"
                        onClick={() => handleSortChange("POPULAR")}
                    />
                    <Button
                        type="button"
                        label="Public Only"
                        styling="px-4 py-2 rounded-full bg-[#003566] text-white hover:bg-[#192a39] hover:cursor-pointer"
                        onClick={() => handleSortChange("PUBLIC")}
                    />
                </div>
            </div>

            {/* Search bar */}
            <div className="mt-8 mb-10">
                <div className="relative">
                    <input
                        type="search"
                        placeholder="Search playlists..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full px-5 py-4 rounded-full border-2 border-[#ffc300] focus:outline-none focus:border-[#003566] text-[#003566]"
                    />
                    <Button
                        type="button"
                        styling="absolute right-4 top-4 text-[#003566]"
                        icon={searchIcon}
                    />
                </div>
            </div>

            {/* Search results */}
            <div className="flex flex-col gap-2 mt-4">
                <h4 className="text-xl text-[#003566]">
                    {searchTerm ? `Results for ${searchTerm}` : "All playlists"}
                </h4>

                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        Loading...
                    </div>
                ) : filteredPlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full mt-5 rounded-xl">
                        {filteredPlaylists.map((playlist) =>
                            playlist.isPublic ? (
                                <Link
                                    to={`/playlists/${playlist.name
                                        .split(" ")
                                        .join("-")}/${playlist.id}`}
                                    key={playlist.id}
                                >
                                    <div className="flex justify-between items-center gap-3 w-full h-15 bg-[#ffc300] hover:bg-[#aa8304] rounded-3xl px-4 py-4 text-white">
                                        <img
                                            src={playlist.coverImage}
                                            alt="cover image"
                                            width={50}
                                            height={60}
                                        />
                                        <div className="flex items-center justify-between w-full">
                                            <p className="text-nowrap text-xl text-white">
                                                {playlist.name}
                                            </p>
                                            <div className="flex justify-between items-center gap-2">
                                                <p className="text-nowrap text-white flex justify-end gap-1">
                                                    {playlist.likes}{" "}
                                                    <img
                                                        src={likedHeartIcon}
                                                        alt="heart icon"
                                                        width={20}
                                                        height={20}
                                                    />{" "}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ) : (
                                <div
                                    onClick={() =>
                                        handlePrivatePlaylistClick(playlist.id)
                                    }
                                    key={playlist.id}
                                    className="hover:cursor-pointer"
                                >
                                    <div className="flex justify-between items-center gap-3 w-full h-15 bg-[#ffc300] hover:bg-[#aa8304] hover:cursor-pointer rounded-3xl px-4 py-4 text-white">
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
                                            <div className="flex justify-between items-center gap-2">
                                                <img
                                                    src={lockIcon}
                                                    alt="lock icon"
                                                    width={20}
                                                    height={20}
                                                ></img>

                                                <p className="text-nowrap text-white flex justify-end gap-1">
                                                    {playlist.likes}{" "}
                                                    <img
                                                        src={likedHeartIcon}
                                                        alt="heart"
                                                        width={20}
                                                        height={20}
                                                    />{" "}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center items-center rounded-xl bg-gray-200 p-8 mt-4">
                        {searchTerm
                            ? `No playlist found matching ${searchTerm}.`
                            : "No playlists available."}
                    </div>
                )}
            </div>

            {/* Modal component */}
            {showModal && (
                <Modal
                    OnClose={() => setShowModal(false)}
                    playlistId={selectedPlaylistId}
                    navigateTo={`/playlists/${allPlaylists
                        .find((playlist) => playlist.id === selectedPlaylistId)
                        ?.name.split(" ")
                        .join("-")}/${selectedPlaylistId}`}
                />
            )}

            {errors.playlists && (
                <span className="text-red-500 mt-2 block">
                    {errors.playlists}
                </span>
            )}
        </div>
    );
}

export default Playlists;
