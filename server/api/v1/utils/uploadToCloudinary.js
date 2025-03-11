import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log(
            "File uploaded to cloudinary, file src: " + uploadResult.url
        );

        fs.unlinkSync(localFilePath);

        return uploadResult;
    } catch (error) {
        console.error("Cloudinary error. ", error);
        fs.unlinkSync(localFilePath);
        return null;
    }
};

export { uploadToCloudinary };
