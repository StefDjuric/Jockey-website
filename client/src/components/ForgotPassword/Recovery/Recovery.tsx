import { useState, FormEvent } from "react";
import Button from "../../Button/Button";
import { useNavigate } from "react-router-dom";

function page() {
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        password: "",
        repeatPassword: "",
        token: window.location.href.split("?token=")[1],
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.password) newErrors.password = "Password is required.";
        else if (formData.password.length < 6)
            newErrors.password = "Password should be 6 characters or longer.";
        else if (formData.password !== formData.repeatPassword)
            newErrors.repeatPassword = "Passwords must match.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        setErrors({});

        if (!validateForm()) return;

        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/recovery",
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
                throw new Error(data.message || "Failed to change password");
            }

            navigate("/login");
        } catch (error: any) {
            setErrors({
                repeatPassword: error.message || "Could not change password.",
            });
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular flex justify-center items-center w-full min-h-screen">
            <div className="flex flex-col w-[400px] lg:w-[500px] justify-center  items-center shadow-xl p-12">
                <form
                    noValidate
                    className="flex flex-col gap-6"
                    onSubmit={handleSubmit}
                >
                    <h1 className="text-3xl mb-6">Account recovery</h1>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="text-md">
                            New password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="rounded-lg border-2 border-[#003566] px-2 py-1"
                            value={formData.password}
                            onChange={(event) =>
                                setFormData({
                                    ...formData,
                                    password: event.target.value,
                                })
                            }
                        />
                        {errors.password && (
                            <span style={{ color: "red" }}>
                                {errors.password}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="repeatPassword" className="text-md">
                            Confirm password
                        </label>
                        <input
                            type="password"
                            name="repeatPassword"
                            id="repeatPassword"
                            className="rounded-lg border-2 border-[#003566] px-2 py-1"
                            value={formData.repeatPassword}
                            onChange={(event) => {
                                setFormData({
                                    ...formData,
                                    repeatPassword: event.target.value,
                                });
                            }}
                        />
                    </div>
                    {errors.repeatPassword && (
                        <span style={{ color: "red" }}>
                            {errors.repeatPassword}
                        </span>
                    )}

                    <Button
                        type={"submit"}
                        label={"Recover account"}
                        styling={
                            "w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39] mb-8"
                        }
                    />
                    {errors.user && (
                        <span style={{ color: "red" }}>{errors.user}</span>
                    )}
                </form>
            </div>
        </div>
    );
}

export default page;
