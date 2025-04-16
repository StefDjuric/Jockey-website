import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, mimeType) => {
    try {
        if (!fileBuffer) return null;

        // Convert buffer to base64 string
        const b64 = Buffer.from(fileBuffer).toString("base64");
        const dataURI = `data:${mimeType};base64,${b64}`;

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto",
        });

        console.log(
            "File uploaded to cloudinary, file src: " + uploadResult.url
        );

        return uploadResult;
    } catch (error) {
        console.error("Cloudinary error. ", error);
        return null;
    }
};

export { uploadToCloudinary };
