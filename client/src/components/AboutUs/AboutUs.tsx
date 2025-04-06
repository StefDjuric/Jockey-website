import stefo from "../../assets/stefo.jpg";

function About() {
    return (
        <div className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0  w-full min-h-screen flex flex-col mb-10 poppins-regular">
            <h1 className="poppins-bold text-3xl text-center mb-5">About me</h1>
            <div className="flex justify-center items-center gap-10">
                <div className="flex flex-col gap-5 p-8 shadow-2xl">
                    <img
                        src={stefo}
                        alt="Stefan Djuric"
                        width={300}
                        height={600}
                    ></img>
                    <div className="flex flex-col gap-3">
                        <p className="poppins-bold text-3xl">Stefan Đurić</p>
                        <p className="text-xl text-gray-400">Student</p>
                        <p className="trxt-xl">Creator</p>
                        <p className="text-xl">
                            Contact me at:{" "}
                            <a href="mailto:stephdjury@gmail.com">
                                stephdjury@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center ">
                <div className="flex flex-col max-w-[300px] text-center gap-2">
                    <h2 className="poppins-bold my-4">
                        How did this come about?
                    </h2>
                    <p className="text-lg">
                        This website was made because i am a student on a path
                        of improving my skills, so i decided to build a project
                        that would test myself, which this definitely did.
                        <br />
                    </p>

                    <p className="text-lg">
                        I ended up making a collaborative music playling
                        playlist with chat implemented using Socket.io. This
                        site was made using
                        NodeJS/Typescript/ExpressJS/Postgresql/React.
                        <br />
                    </p>
                    <p className="text-lg my-2">
                        On this website you can create a playlist and add songs
                        to it, collaborate with others on their playlists and
                        chat with others in real time in playlist rooms.
                        <br />
                    </p>
                </div>
            </div>
        </div>
    );
}

export default About;
