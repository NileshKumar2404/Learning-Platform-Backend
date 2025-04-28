import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("Local file path is missing");
            return null
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            source: true
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