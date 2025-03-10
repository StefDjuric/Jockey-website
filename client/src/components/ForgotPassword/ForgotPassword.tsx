import { useState, FormEvent } from "react";
import Button from "../Button/Button";

function page() {
    const [mailSent, setMailSent] = useState<boolean>(false);
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        email: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.email) {
            newErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
            newErrors.email = "Email is invalid.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const onSendRecoveryMail = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        setErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:3000/api/v1/users/forgot-password",
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
                throw new Error(data.message || "Failed to sent mail.");
            }

            setMailSent(true);
        } catch (error: any) {
            const newErrors: { [key: string]: string } = {};
            newErrors.email = error.message;

            setErrors(newErrors);
        }
    };

    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 poppins-regular flex justify-center items-center w-full min-h-screen">
            <div className="flex flex-col w-[400px] lg:w-[500px] items-center justify-center shadow-2xl rounded-lg p-12">
                {mailSent ? (
                    <div className="flex flex-col justify-center items-center mb-5 gap-5">
                        <h2 className="text-xl">
                            Account recovery mail sent to {formData.email}
                        </h2>
                        <p className="text-lg">
                            If you don't see this email in your inbox within 15
                            minutes, look for it in your junk mail folder. If
                            you find it there, please mark it as “Not Junk”
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col justify-center items-center mb-5">
                            <p className="text-lg">
                                Forgot your accounts password? Enter your email
                                address and we'll send you a recovery mail.
                            </p>
                        </div>
                        <form
                            onSubmit={onSendRecoveryMail}
                            className="flex flex-col text-lg gap-2 items-start justify-start w-full"
                            noValidate
                        >
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="rounded-lg px-2 py-1 border-2 border-[#004566] text-lg w-full mb-5"
                                value={formData.email}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        email: event.target.value,
                                    })
                                }
                            />
                            {errors.email && (
                                <span
                                    className="text-lg"
                                    style={{ color: "red" }}
                                >
                                    {errors.email}
                                </span>
                            )}
                            <Button
                                type={"submit"}
                                label={"Send recovery email"}
                                styling="w-full text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39] mb-8"
                            />
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default page;
