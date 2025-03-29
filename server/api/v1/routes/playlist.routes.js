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
    likePlaylist,
    checkIfLiked,
    editPlaylist,
    deletePlaylist,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists);
router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/get-trending-playlists").get(verifyJWT, getTrendingPlaylists);
router.route("/is-made-by-user/:playlistId").get(verifyJWT, isMadeByUser);
router.route("/get-playlist-songs/:playlistId").get(verifyJWT, getPlaylist);
router.route("/add-song").post(verifyJWT, addSongToPlaylist);
router.route("/update-song-status").put(verifyJWT, updateSongPlayStatus);
router.route("/like-playlist").put(verifyJWT, likePlaylist);
router.route("/check-if-liked/:playlistId").get(verifyJWT, checkIfLiked);
router.route("/edit-playlist/:playlistId").put(verifyJWT, editPlaylist);
router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

export default router;
