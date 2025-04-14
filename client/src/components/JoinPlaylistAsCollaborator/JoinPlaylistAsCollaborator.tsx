import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../Button/Button";

function JoinPlaylist() {
    const [searchParams] = useSearchParams();
    const shareCode = searchParams.get("shareCode");
    const navigate = useNavigate();
    const [playlistDetails, setPlaylistDetails] = useState<{
        name: string;
        creatorName: string;
        coverImage?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function getPlaylistDetails() {
            try {
                const response = await fetch(
                    `https://jockey-website.onrender.com/api/v1/playlists/get-playlist-by-share-code?shareCode=${shareCode}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message || "Failed to get playlist details."
                    );
                }

                setPlaylistDetails(data.data.playlist);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        if (shareCode) {
            getPlaylistDetails();
        }
    }, [shareCode]);

    const handleJoinPlaylist = async (role: string) => {
        try {
            setLoading(true);
            const response = await fetch(
                "https://jockey-website.onrender.com/api/v1/playlists/join-playlist",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        shareCode,
                        role: role,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to join playlist.");
            }

            setSuccess(`You have successfully joined as a ${data.data.role}`);

            setTimeout(() => {
                navigate(
                    `/playlists/${data.data.playlistName
                        .split(" ")
                        .join("-")}/${data.data.playlistId}`
                );
            }, 2000);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-2xl">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-2xl text-red-500">{error}</p>
                <Button
                    label="Go to Dashboard"
                    onClick={() => navigate("/dashboard")}
                    styling="px-6 py-3 bg-[#ffc300] text-black rounded-lg hover:bg-[#aa8304] hover:cursor-pointer"
                    type="button"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
            {success && <p className="text-green-500 text-xl">{success}</p>}

            <div className="bg-gray-100 p-8 rounded-lg shadow-md max-w-lg w-full">
                <div className="flex items-center gap-4 mb-6">
                    {playlistDetails?.coverImage && (
                        <img
                            src={playlistDetails.coverImage}
                            alt="Playlist cover"
                            className="w-24 h-24 rounded-md"
                        />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">
                            {playlistDetails?.name}
                        </h1>
                        <p className="text-gray-600">
                            Created by: {playlistDetails?.creatorName}
                        </p>
                    </div>
                </div>

                <p className="text-lg mb-6">
                    You've been invited to collaborate on this playlist. By
                    joining, you'll be able to add songs and help curate the
                    playlist.
                </p>

                <div className="flex justify-center">
                    <Button
                        label="Join as Collaborator"
                        onClick={() => handleJoinPlaylist("collaborator")}
                        styling="px-6 py-3 bg-[#ffc300] text-black rounded-lg hover:bg-[#aa8304] w-full"
                        type="button"
                    />
                </div>
            </div>
        </div>
    );
}

export default JoinPlaylist;
