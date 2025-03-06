import Button from "../Button/Button";
import Hamburger from "../../assets/menu.svg";
import XMark from "../../assets/xmark-solid.svg";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Navbar(): React.ReactElement {
    const [isHamburgerOpen, setisHamburgerOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenuDropdown = (): void => {
        setisHamburgerOpen(!isHamburgerOpen);
    };

    useEffect(() => {
        const closeOpenMenus = (event: MouseEvent): void => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setisHamburgerOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOpenMenus);
        return () => document.removeEventListener("mousedown", closeOpenMenus);
    }, []);

    return (
        <nav className="flex justify-between items-center mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 relative z-30 py-5 poppins-regular">
            <Link
                className="font-bold text-4xl text-[#ffc300] poppins-bold"
                to="/"
            >
                Jockey
            </Link>
            <div className="hidden lg:flex lg:justify-between lg:items-center lg:gap-8">
                <Link to="/signup">
                    <Button
                        type="button"
                        label="Sign Up"
                        styling="rounded-xl text-lg px-4 py-2 bg-[#ffc300] text-white hover:cursor-pointer hover:bg-[#aa8304]"
                    />
                </Link>

                <Link to="/login">
                    <Button
                        type="button"
                        label="Log In"
                        styling="rounded-xl text-lg px-4 py-2 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39]"
                    />
                </Link>
            </div>

            {/* Hamburger menu */}
            <div
                className="flex justify-center items-center lg:hidden"
                ref={menuRef}
            >
                <div className="relative inline-block text-left">
                    <img
                        onClick={toggleMenuDropdown}
                        src={isHamburgerOpen ? XMark : Hamburger}
                        alt="hamburger menu"
                        className="hover:cursor-pointer"
                        width={28}
                        height={28}
                    />
                    <ul
                        className={`flex flex-col fixed top-16  gap-8 ${
                            isHamburgerOpen
                                ? "translate-x-0"
                                : "translate-x-full"
                        } right-0 min-h-screen w-[250px] z-50 bg-white shadow-2xl  items-center text-lg text-[#003566]  pb-1.5 transition-all ease-in-out duration-300`}
                    >
                        <li className="mt-20">
                            <Link
                                to={"/about"}
                                className="hover:text-[#ffc300]"
                            >
                                About us
                            </Link>
                        </li>
                        <li>
                            <Link
                                to={"/contact"}
                                className="hover:text-[#ffc300]"
                            >
                                Contact us
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
