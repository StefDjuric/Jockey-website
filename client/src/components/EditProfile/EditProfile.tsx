import { FormEvent, useState } from "react";
import Button from "../Button/Button";
import { useAuth } from "../Providers/AuthContextProvider";
import { useNavigate } from "react-router-dom";

function EditProfile() {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [success, setSuccess] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const { setIsLoggedIn } = useAuth();

    const navigate = useNavigate();

    const validateForm = (formDataType: string) => {
        const newErrors: { [key: string]: string } = {};

        if (formDataType === "USERNAME") {
            if (!formData.username) {
                newErrors.username =
                    "You have to fill in the field to change the username.";
            } else if (formData.username.length < 5) {
                newErrors.username =
                    "The username has to be at least 5 characters long.";
            }
        } else if (formDataType === "EMAIL") {
            if (!formData.email) {
                newErrors.email =
                    "Email field is required to change the email.";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
                newErrors.email = "Invalid email adress.";
            }
        } else if (formDataType === "PASSWORD") {
            if (!formData.password) {
                newErrors.password =
                    "Password field is required to change the password.";
            } else if (formData.password.length < 6) {
                newErrors.password =
                    "Password should be at least 6 characters long.";
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = "Passwords have to match.";
            }
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleUpdateUsername = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm("USERNAME")) return;

        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/users/edit-username`,
                {
                    method: "PUT",
                    credentials: "include",
                    body: JSON.stringify({ username: formData.username }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();
            if (data.data?.success) {
                setSuccess({
                    username: `Successfully updated username to ${data.data?.updatedUsername}.`,
                });
            }
        } catch (error: any) {
            setErrors({
                username: error?.message || "Failed to update username",
            });
            setSuccess({});
        }
    };

    const handleUpdatePassword = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm("PASSWORD")) return;

        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/users/edit-password`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        confirmPassword: formData.confirmPassword,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (data.data?.success) {
                setSuccess({ password: "Password updated successfully." });
            }
        } catch (error: any) {
            setErrors({
                password: error?.message || "Failed to update password.",
            });
            setSuccess({});
        }
    };

    const handleUpdateEmail = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm("EMAIL")) return;

        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/users/edit-email`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: formData.email }),
                }
            );

            const data = await response.json();

            if (data.data?.success) {
                setSuccess({
                    email: `Email updated successfully to ${data.data.updatedEmail}.`,
                });
                setTimeout(() => {
                    setIsLoggedIn(false);
                    navigate("/", { replace: true });
                }, 2000);
            }
        } catch (error: any) {
            setErrors({ email: error?.message });
            setSuccess({});
        }
    };

    const handleDeleteProfile = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch(
                `http://localhost:3000/api/v1/users/delete-profile`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (data.data?.success) {
                setSuccess({ delete: "Successfully deleted your profile." });
                setTimeout(() => {
                    setIsLoggedIn(false);
                    navigate("/", { replace: true });
                }, 2000);
            }
        } catch (error: any) {
            setErrors({
                delete: error?.message || "Failed to delete profile.",
            });
            setSuccess({});
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 w-full min-h-screen flex flex-col mt-10 gap-5 poppins-regular">
            <h1 className="poppins-bold text-4xl">Edit your profile</h1>

            <form noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-xl">
                        Change username
                    </label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                username: event.target.value,
                            })
                        }
                        className="border-2 border-[#003566] rounded-lg px-4 py-2"
                    />
                    {success.username && (
                        <span className="text-green-500">
                            {success.username}
                        </span>
                    )}
                    {errors.username && (
                        <span className="text-red-500 text-sm">
                            {errors.username}
                        </span>
                    )}
                </div>
                <Button
                    type="submit"
                    label="Update username"
                    styling="w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39]"
                    onClick={handleUpdateUsername}
                />
            </form>
            <div className="h-0.5 bg-gray-30"></div>
            <form noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-lg">
                        Change password
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                password: event.target.value,
                            })
                        }
                        className="border-2 border-[#003566] rounded-lg px-4 py-2"
                    />
                    {errors.password && (
                        <span className="text-red-500 text-sm">
                            {errors.password}
                        </span>
                    )}
                    <label htmlFor="confirmPassword" className="text-lg">
                        Confirm password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                confirmPassword: event.target.value,
                            })
                        }
                        className="border-2 border-[#003566] rounded-lg px-4 py-2"
                    />
                    {errors.confirmPassword && (
                        <span className="text-red-500 text-sm">
                            {errors.confirmPassword}
                        </span>
                    )}
                    {success.password && (
                        <span className="text-green-500">
                            {success.password}
                        </span>
                    )}
                </div>
                <Button
                    type="submit"
                    label="Update password"
                    styling="w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39]"
                    onClick={handleUpdatePassword}
                />
            </form>
            <div className="h-0.5 bg-gray-30"></div>

            <form noValidate className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                        <label htmlFor="email" className="text-lg">
                            Change your Email
                        </label>
                        <p className="text-sm text-gray-300">
                            You will be logged out.
                        </p>
                    </div>

                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={(event) =>
                            setFormData({
                                ...formData,
                                email: event.target.value,
                            })
                        }
                        className="border-2 border-[#003566] rounded-lg px-4 py-2"
                    />
                    {errors.email && (
                        <span className="text-red-500 text-sm">
                            {errors.email}
                        </span>
                    )}
                </div>
                <Button
                    type="submit"
                    label="Update email"
                    styling="w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39]"
                    onClick={handleUpdateEmail}
                />
                {success.email && (
                    <span className="text-green-500">{success.email}</span>
                )}
            </form>
            <div className="h-0.5 bg-gray-30"></div>
            <div className="flex flex-col gap-4">
                <h4 className="text-lg">Delete profile</h4>
                <p className="text-sm text-gray-300">
                    Before confirming that you would like your profile deleted,
                    we'd like to take a moment to explain the implications of
                    deletion:
                </p>
                <ul>
                    <li className="text-sm text-gray-300">
                        Deletion is irreversible, and you will have no way to
                        regain any of your original content, should this
                        deletion be carried out and you change your mind later
                        on.
                    </li>
                    <li className="text-sm text-gray-300">
                        Your playlists and songs will be deleted from the site.
                    </li>
                </ul>
                <Button
                    type="button"
                    label="Delete profile"
                    styling="rounded-lg bg-red-500 px-8 py-3 text-white hover:bg-red-600 hover:cursor-pointer"
                    onClick={handleDeleteProfile}
                />
            </div>
            {errors.delete && (
                <span className="text-red-500 text-sm">{errors.delete}</span>
            )}
            {success.delete && (
                <span className="text-green-500 text-sm">{success.delete}</span>
            )}
        </div>
    );
}

export default EditProfile;
