import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (request, file, cb) {
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|/;

        const extname = fileTypes.test(
            path.extname(file.originalname).toLowerCase()
        );

        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error("Only supported files are images."));
        }
    },
});
