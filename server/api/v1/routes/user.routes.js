import { Router } from "express";
import {
    registerUser,
    loginUser,
    sendMailToResetPassword,
    recoverPassword,
    logOut,
    uploadImage,
    checkAuthentication,
    checkIfCollaborator,
    checkIfMember,
    updateUsername,
    updatePassword,
    updateEmail,
    deleteProfile,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(sendMailToResetPassword);
router.route("/recovery").post(recoverPassword);
router.route("/logout").post(verifyJWT, logOut);
router
    .route("/upload-image")
    .post(verifyJWT, upload.single("file"), uploadImage);
router.route("/check-auth").get(checkAuthentication);
router
    .route("/check-if-collaborator/:playlistId")
    .get(verifyJWT, checkIfCollaborator);
router.route("/is-member-already/:playlistId").get(verifyJWT, checkIfMember);
router.route("/edit-username").put(verifyJWT, updateUsername);
router.route("/edit-password").put(verifyJWT, updatePassword);
router.route("/edit-email").put(verifyJWT, updateEmail);
router.route("/delete-profile").delete(verifyJWT, deleteProfile);

export default router;
