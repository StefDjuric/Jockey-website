import { Link, useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import { FormEvent, useState } from "react";
import { useAuth } from "../Providers/AuthContextProvider";

function LogIn() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        emailOrUsername: "",
        password: "",
    });
    const { setIsLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleLogIn = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Log in failed");
            }

            setIsLoggedIn(true);

            console.log(data);
            navigate("/dashboard", { replace: true });
        } catch (error: any) {
            setErrors({
                password: error.message || "An unexpected error occured.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.emailOrUsername) {
            newErrors.emailOrUsername = "Please provide email or username.";
        }

        if (!formData.password) {
            newErrors.password = "Please provide a password.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-30 3xl:px-0 poppins-regular  flex justify-center items-center min-h-screen w-full">
            <div className="flex flex-col min-w-[300px] lg:min-w-[400px] gap-8 shadow-2xl rounded-lg p-12">
                <div className="flex justify-center items-center">
                    <Link to="/">
                        <h1 className="poppins-bold font-bold text-[#ffc300] text-3xl text-nowrap mb-8">
                            Jockey
                        </h1>
                    </Link>
                </div>
                <form className="flex flex-col" noValidate>
                    <div className="flex flex-col gap-4 mb-5">
                        <label htmlFor="email" className="text-lg">
                            Email or Username
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.emailOrUsername}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    emailOrUsername: event.target.value,
                                })
                            }
                            className="rounded-lg px-2 py-1 border-[#003566] border-2"
                        />
                        {errors.emailOrUsername && (
                            <span style={{ color: "red" }}>
                                {errors.emailOrUsername}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-4 mb-10">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="text-lg">
                                Password
                            </label>
                            <p className="text-sm text-blue-600">
                                <Link to="/forgot-password">
                                    Forgot password?
                                </Link>
                            </p>
                        </div>

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
                            className="rounded-lg px-2 py-1 border-[#003566] border-2"
                        />
                        {errors.password && (
                            <span style={{ color: "red" }}>
                                {errors.password}
                            </span>
                        )}
                    </div>
                    <Button
                        type="submit"
                        label={isLoading ? "Logging in..." : "Log in"}
                        styling="rounded-full w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39] mb-8"
                        disabled={isLoading}
                        onClick={handleLogIn}
                    />
                </form>
                <p className="text-md">
                    Don't have an account?{" "}
                    <span className="text-blue-600">
                        <Link to="/signup">Sign up.</Link>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default LogIn;
