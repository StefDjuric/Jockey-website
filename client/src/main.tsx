import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./components/Home.tsx";
import Layout from "./Layout.tsx";
import SignUp from "./components/SignUp/SignUp.tsx";
import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from "react-router-dom";
import LogIn from "./components/LogIn/LogIn.tsx";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword.tsx";
import Recovery from "./components/ForgotPassword/Recovery/Recovery.tsx";
import Dashboard from "./components/Dashboard/Dashboard.tsx";
import CreatePlaylist from "./components/CreatePlaylist/CreatePlaylist.tsx";
import Playlists from "./components/Playlists/Playlists.tsx";
import { AuthProvider } from "./components/Providers/AuthContextProvider.tsx";
import ProtectedRoutes from "./components/ProtectedRoutes/ProtectedRoutes.tsx";
import PublicRoutes from "./components/PublicRoutes/PublicRoutes.tsx";
import Playlist from "./components/Playlist/Playlist.tsx";
import EditPlaylist from "./components/EditPlaylist/EditPlaylist.tsx";
import JoinPlaylist from "./components/JoinPlaylistAsCollaborator/JoinPlaylistAsCollaborator.tsx";
import About from "./components/AboutUs/AboutUs.tsx";
import Contact from "./components/ContactUs/ContactUs.tsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route element={<PublicRoutes />}>
                <Route path="" element={<Home />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="login" element={<LogIn />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="forgot-password/recovery" element={<Recovery />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="playlists" element={<Playlists />} />
                <Route path="playlists/:title/:id" element={<Playlist />} />
                <Route
                    path="edit-playlist/:title/:id"
                    element={<EditPlaylist />}
                />
                <Route path="playlists/create" element={<CreatePlaylist />} />
                <Route path="join-playlist" element={<JoinPlaylist />} />
            </Route>
        </Route>
    )
);

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
);
