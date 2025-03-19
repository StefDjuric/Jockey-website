import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    getUserPlaylists,
    createPlaylist,
    getTrendingPlaylists,
    isMadeByUser,
    getPlaylist,
    addSongToPlaylist,
    updateSongPlayStatus,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/get-trending-playlists").get(verifyJWT, getTrendingPlaylists);
router.route("/is-made-by-user/:playlistId").get(verifyJWT, isMadeByUser);
router.route("/get-playlist-songs/:playlistId").get(verifyJWT, getPlaylist);
router.route("/add-song").post(verifyJWT, addSongToPlaylist);
router.route("/update-song-status").put(verifyJWT, updateSongPlayStatus);

export default router;
