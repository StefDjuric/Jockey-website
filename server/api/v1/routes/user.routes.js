import { Router } from "express";
import {
    registerUser,
    loginUser,
    sendMailToResetPassword,
    recoverPassword,
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(sendMailToResetPassword);
router.route("/recovery").post(recoverPassword);

export default router;
