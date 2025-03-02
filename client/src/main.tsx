import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import Footer from "./components/Footer/Footer.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Navbar />
        <App />
        <Footer />
    </StrictMode>
);
