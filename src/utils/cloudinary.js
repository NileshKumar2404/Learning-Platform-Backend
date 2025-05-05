import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import dotenv from 'dotenv';

dotenv.config(); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("Local file path is missing");
            return null
        }

        // console.log("Cloudinary config:", {
        //     cloud_name: process.env.CLOUDINARY_API_NAME,
        //     api_key: process.env.CLOUDINARY_API_KEY,
        //     api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing!"
        // });
        

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            // source: true
        })
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.error("Error uploading in cloudinary: ", error);
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}