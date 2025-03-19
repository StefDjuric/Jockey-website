import express, { urlencoded } from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import { errorHandler } from "./api/v1/middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/dist")));

// import routes
import healthCheckRouter from "./api/v1/routes/healthcheck.routes.js";
import userRoutes from "./api/v1/routes/user.routes.js";
import playlistRoutes from "./api/v1/routes/playlist.routes.js";
import youtubeRoutes from "./api/v1/routes/youtube.routes.js";

app.use(errorHandler);

// routes
app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/youtube", youtubeRoutes);

// render react
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

export { app };
