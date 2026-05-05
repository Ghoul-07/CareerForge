import path from "path";
import cloudinary from "../config/cloudinary.js";

export function uploadBufferToCloudinary(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName); // .pdf
    const nameWithoutExt = path.basename(originalName, ext);

    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "careerforge/resumes",
        resource_type: "raw",

        // IMPORTANT: raw files need extension in public_id
        public_id: `${Date.now()}-${safeName}${ext}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
}