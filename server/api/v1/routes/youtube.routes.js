import { Router } from "express";
import { searchYoutube } from "../controllers/youtube.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/search").get(verifyJWT, searchYoutube);

export default router;
