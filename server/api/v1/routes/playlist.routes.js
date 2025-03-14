import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getUserPlaylists,
    createPlaylist,
    getTrendingPlaylists,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/get-trending-playlists").get(verifyJWT, getTrendingPlaylists);

export default router;
