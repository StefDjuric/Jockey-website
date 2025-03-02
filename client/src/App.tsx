import bgImage from "./assets/bg-image.jpg";
import Button from "./components/Button/Button";

function App() {
    return (
        <main
            style={{ backgroundImage: `url(${bgImage})` }}
            className="overflow-hidden bg-cover bg-no-repeat flex justify-center items-center mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 min-h-screen poppins-regular"
        >
            <div className="flex flex-col items-center gap-10">
                <div className="flex flex-col gap-10 w-[50%]">
                    <h1 className="text-[#ffc300] text-5xl lg:text-7xl poppins-bold text-center">
                        Jockey
                    </h1>
                    <p className="text-white text-xl lg:text-3xl text-center">
                        Jockey connects you with others through music. Create
                        your own playlists and collaborate with others on them.
                        <br />
                        <span className="font-bold poppins-bold text-2xl lg:text-4xl">
                            Get started right now.
                        </span>
                    </p>
                </div>
                <div className="flex flex-col justify-around items-center gap-5 w-full">
                    <Button
                        label="Sign Up"
                        type="button"
                        styling="rounded-full w-[40%] text-lg px-4 py-4 bg-[#ffc300] text-white hover:cursor-pointer hover:bg-[#aa8304]"
                    />
                    <Button
                        label="Log In"
                        type="button"
                        styling="rounded-full w-[40%] text-lg px-4 py-4 bg-[#003566] text-white hover:cursor-pointer hover:bg-[#192a39]"
                    />
                </div>
            </div>
        </main>
    );
}

export default App;
