import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImageToCloudinary = async (buffer: Uint8Array) =>
  await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      })
      .end(buffer);
  });

export default cloudinary;
