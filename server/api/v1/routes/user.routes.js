import { Router } from "express";
import {
    registerUser,
    loginUser,
    sendMailToResetPassword,
    recoverPassword,
    logOut,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(sendMailToResetPassword);
router.route("/recovery").post(recoverPassword);
router.route("/logout").post(verifyJWT, logOut);

export default router;
