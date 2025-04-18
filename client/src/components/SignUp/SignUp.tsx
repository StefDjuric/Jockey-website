import Button from "../Button/Button";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUp() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({
        username: "",
        email: "",
        password: "",
    });
    const [user, setUser] = useState<{ [key: string]: string }>({
        username: "",
        password: "",
        email: "",
    });

    const navigate = useNavigate();

    // Returns true if no errors
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!user.email) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(user.email)) {
            newErrors.email = "Invalid email address.";
        }

        if (!user.username) {
            newErrors.username = "Username is required.";
        } else if (user.username.length < 5) {
            newErrors.username = "Username must be at least 5 characters long.";
        }

        if (!user.password) {
            newErrors.password = "Password is required.";
        } else if (user.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async (event: FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch(
                "https://jockey-website.onrender.com/api/v1/users/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Sign up failed.");
            }

            console.log(data);

            navigate("/login", { replace: true });
        } catch (error: any) {
            setErrors({
                password: error.message || "An unexpected error occured.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular w-full flex justify-center items-center min-h-screen">
            <div className="flex flex-col min-w-[300px] lg:min-w-[400px] gap-8 shadow-2xl rounded-lg p-12">
                <div className="flex flex-col lg:justify-center gap-4 mb-4">
                    <a href="/">
                        <span className="text-[#ffc300] font-bold text-3xl">
                            Jockey
                        </span>
                    </a>
                    <h1 className="text-2xl poppins-bold text-nowrap">
                        Join us right now
                    </h1>
                </div>
                <form className="flex flex-col" noValidate>
                    <div className="flex flex-col gap-4 mb-5">
                        <label className="text-xl" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={user.email}
                            onChange={(event) =>
                                setUser({ ...user, email: event.target.value })
                            }
                            className="rounded-lg border-2 border-[#003566] px-2 py-1"
                        />
                        {errors.email && (
                            <span style={{ color: "red" }}>{errors.email}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-4 mb-5">
                        <label className="text-lg" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={user.username}
                            onChange={(event) =>
                                setUser({
                                    ...user,
                                    username: event.target.value,
                                })
                            }
                            className="rounded-lg border-2 border-[#003566] px-2 py-1"
                        />
                        {errors.username && (
                            <span style={{ color: "red" }}>
                                {errors.username}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-4 mb-10">
                        <label className="text-lg" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={user.password}
                            onChange={(event) =>
                                setUser({
                                    ...user,
                                    password: event.target.value,
                                })
                            }
                            className="rounded-lg border-2 border-[#003566] px-2 py-1"
                        />
                        {errors.password && (
                            <span style={{ color: "red" }}>
                                {errors.password}
                            </span>
                        )}
                    </div>
                    <Button
                        label={isLoading ? "Signing up..." : "Sign up"}
                        type={"submit"}
                        styling="rounded-full w-full text-lg px-4 py-4 bg-[#ffc300] text-white hover:cursor-pointer hover:bg-[#aa8304]"
                        onClick={handleSignIn}
                        disabled={isLoading}
                    />
                </form>
                <p className="text-md">
                    Already have an account?{" "}
                    <span className="text-blue-600">
                        <a href={"/login"}>Log in.</a>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
