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

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<Layout />}>
            <Route path="" element={<Home />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="login" element={<LogIn />} />
        </Route>
    )
);

createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />
);
