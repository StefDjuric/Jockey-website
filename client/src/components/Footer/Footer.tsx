import instagramSvg from "../../assets/instagram.svg";
import facebookSvg from "../../assets/facebook.svg";
import { Link } from "react-router-dom";

function Footer(): React.ReactElement {
    return (
        <footer className="flex justify-center items-center poppins-regular mt-5 pb-5">
            <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 flex w-full lg:justify-between flex-col lg:flex-row lg:items-center items-start gap-14">
                <Link to={"/"}>
                    <h1 className="text-4xl text-[#ffc300] font-bold">
                        Jockey
                    </h1>
                </Link>
                <div className="flex justify-between items-center gap-30">
                    <ul className="flex lg:justify-between items-center flex-col lg:flex-row gap-10 text-xl text-nowrap">
                        <li>
                            <a
                                href="/about"
                                className="hover:text-[#ffc300] text-[#003566]"
                            >
                                About us
                            </a>
                        </li>
                        <li>
                            <a
                                href="/contact"
                                className="hover:text-[#ffc300] text-[#003566]"
                            >
                                Contact us
                            </a>
                        </li>
                    </ul>
                    <ul className="flex flex-col lg:flex-row lg:justify-between items-center text-nowrap gap-4 text-xl text-[#003566]">
                        <p className="">Socials:</p>

                        <li className="flex justify-between items-center hover:text-[#ffc300]">
                            <a
                                href="https://www.instagram.com/stefan_djuric01/"
                                className="flex justify-between items-center gap-1"
                            >
                                <img
                                    src={instagramSvg}
                                    alt="instagram logo"
                                    height={24}
                                    width={24}
                                />{" "}
                                Instagram
                            </a>
                        </li>
                        <li className="flex justify-between items-center hover:text-[#ffc300]">
                            <a
                                href="https://www.facebook.com/stefan.djuric.7771"
                                className="flex justify-between items-center gap-1"
                            >
                                <img
                                    src={facebookSvg}
                                    alt="facebook logo"
                                    width={24}
                                    height={24}
                                />{" "}
                                Facebook
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
