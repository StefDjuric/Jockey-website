import { FormEvent, useEffect, useState } from "react";
import musicImage from "../../assets/music.svg";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";

function CreatePlaylist() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        playlistName: "",
        playlistDescription: "",
        playlistType: "public",
        coverImage: musicImage,
    });
    const [file, setFile] = useState<File>();
    const [imageWidth, setImageWidth] = useState<number>(40);
    const [imageHeight, setImageHeight] = useState<number>(40);

    const navigate = useNavigate();

    const handleImageUpload = async (fileElement: File) => {
        setErrors({});
        const fileData = new FormData();
        fileData.append("file", fileElement);

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/upload-image",
                {
                    method: "POST",
                    body: fileData,

                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Did not upload to cloudinary!"
                );
            }

            setFormData({ ...formData, coverImage: data?.data?.file?.url });

            console.log("Upload successfull.\n ", data);

            return data;
        } catch (error: any) {
            setErrors({ general: error?.message });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (file) {
            handleImageUpload(file);
            setImageHeight(250);
            setImageWidth(200);
        }
    }, [file]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.playlistName) {
            newErrors.playlistName = "Playlist name is required.";
        }
        if (!formData.playlistType) {
            newErrors.playlistType = "Please select playlist type.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const onFormSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/create-playlist",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            console.log(data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to create playlist.");
            }

            navigate("/dashboard");
        } catch (error: any) {
            setErrors({ general: error?.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular w-full min-h-screen flex flex-col gap-10 bg-[#fff] pt-10">
            <h1 className="text-[#003566] poppins-bold text-3xl text-nowrap">
                Create your playlist
            </h1>
            <div className="flex justify-between items-center gap-5 text-nowrap">
                <button
                    type="button"
                    className="w-50 h-40 lg:w-50 lg:h-40 flex justify-center items-center hover:cursor-pointer hover:bg-[#162028] bg-[#003566]"
                >
                    <div className="flex flex-col items-center">
                        <input
                            type="file"
                            className="h-40 w-50 opacity-0 hover:cursor-pointer"
                            onChange={(event) => {
                                if (
                                    event.target &&
                                    event.target.files &&
                                    event.target.files.length > 0
                                ) {
                                    setFile(event.target.files[0]);
                                    event.preventDefault();
                                }
                            }}
                        />
                        {isLoading ? (
                            <div className="relative bottom-20 text-white">
                                Uploading...
                            </div>
                        ) : (
                            <>
                                <img
                                    src={formData.coverImage}
                                    alt="music logo"
                                    width={imageWidth}
                                    height={imageHeight}
                                    className="relative bottom-20"
                                />
                                <p
                                    className={`${
                                        imageWidth > 100 ? "hidden" : ""
                                    } text-white text-sm relative bottom-20`}
                                >
                                    Choose photo
                                </p>
                            </>
                        )}
                    </div>
                </button>
            </div>

            <form
                onSubmit={onFormSubmit}
                className="flex flex-col gap-5 text-[#003566]"
                noValidate
            >
                <div className="flex flex-col gap-2">
                    <label htmlFor="playlist-title" className="text-lg">
                        Playlist name
                    </label>
                    <input
                        type="text"
                        name="playlist-title"
                        value={formData.playlistName}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                playlistName: event.target.value,
                            })
                        }
                        className="border-2 border-[#003566] rounded-lg px-4 py-2"
                    />
                    {errors.playlistName && (
                        <span className="text-red-500">
                            {errors.playlistName}
                        </span>
                    )}
                </div>

                <div className="h-0.5 bg-gray-200 w-full"></div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="playlist-description" className="text-lg">
                        Playlist description (optional)
                    </label>
                    <textarea
                        name="playlist-description"
                        rows={4}
                        value={formData.playlistDescription}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                playlistDescription: event.target.value,
                            })
                        }
                        className="block p-2.5 w-full rounded-lg border-2 border-[#003566] focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                <div className="h-0.5 bg-gray-200 w-full"></div>

                <div className="flex flex-col gap-2">
                    <p className="text-lg">Choose playlist type</p>
                    <div className="flex gap-2">
                        <input
                            type="radio"
                            name="public-playlist"
                            value={"public"}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    playlistType: event.target.value,
                                })
                            }
                            defaultChecked
                        />
                        <label htmlFor="public-playlist">
                            Public (Everybody can join)
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="radio"
                            name="public-playlist"
                            value={"private"}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    playlistType: event.target.value,
                                })
                            }
                        />
                        <label htmlFor="public-playlist">
                            Private (Only users with a code key can join)
                        </label>
                    </div>
                    {errors.playlistType && (
                        <span className="text-red-500">
                            {errors.playlistType}
                        </span>
                    )}
                </div>

                <div className="h-0.5 bg-gray-200 w-full"></div>

                <Button
                    label={
                        isLoading
                            ? "Creating playlist..."
                            : "Finish creating your playlist"
                    }
                    type="submit"
                    styling="w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39] mb-8"
                    disabled={isLoading}
                />
                {errors.general && (
                    <span className="text-red-500">{errors.general}</span>
                )}
            </form>
        </div>
    );
}

export default CreatePlaylist;
