import Button from "../Button/Button";
import XIcon from "../../assets/xmark-solid.svg";
import { FormEvent, MouseEventHandler, useState } from "react";
import { useNavigate } from "react-router-dom";

type ModalProps = {
    OnClose: MouseEventHandler<HTMLButtonElement>;
    navigateTo: string;
    playlistId: number | null;
};

function Modal({ OnClose, navigateTo, playlistId }: ModalProps) {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [shareCode, setShareCode] = useState("");
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!shareCode) {
            setErrors({
                shareCode: "Share code is required before submitting.",
            });
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const onModalSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/playlists/join-private-playlist",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ shareCode, playlistId: playlistId }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to join playlist.");
            } else {
                navigate(navigateTo, { replace: true });
            }
        } catch (error: any) {
            setErrors({ shareCode: error?.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-300 bg-opacity-30 backdrop-blur-sm flex justify-center items-center poppins-regular">
            <div className="mt-10 flex flex-col gap-5 text-black">
                <div className="bg-white rounded-xl px-20 py-10 flex flex-col gap-5 items-center mx-4">
                    <Button
                        type="button"
                        icon={XIcon}
                        styling="place-self-end hover:cursor-pointer"
                        onClick={OnClose}
                    />
                    <h4 className="text-3xl poppins-bold">
                        This is a private playlist.
                    </h4>
                    <p className="text-2xl max-w-md text-center">
                        Please enter the share code to enter this playlist{" "}
                    </p>
                    <form
                        onSubmit={onModalSubmit}
                        className="flex flex-col gap-5 items-center justify-center"
                        noValidate
                    >
                        <input
                            type="text"
                            placeholder="Enter the share code"
                            value={shareCode}
                            onChange={(event) =>
                                setShareCode(event.target.value)
                            }
                            required
                            className="rounded-lg border-2 border-[#003566] px-2 py-1 text-black"
                        />
                        {errors.shareCode && (
                            <span className="text-red-500">
                                {errors.shareCode}
                            </span>
                        )}
                        <Button
                            type="submit"
                            label={
                                isLoading ? "Loading..." : "Proceed to playlist"
                            }
                            styling="px-6 py-3 bg-[#ffc300] text-black rounded-lg hover:bg-[#aa8304] hover:cursor-pointer"
                            disabled={isLoading}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Modal;
