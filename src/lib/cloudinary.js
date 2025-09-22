// lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Debug: Log config on server start
console.log("☁️ Cloudinary Config Check:");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Set" : "❌ MISSING");
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Set" : "❌ MISSING");
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Set" : "❌ MISSING");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file) {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "ai-blog-posts",
          transformation: [{ width: 1200, height: 630, crop: "limit" }],
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject(error);
          } else {
            console.log("✅ Upload Success:", result.secure_url);
            resolve(result);
          }
        }
      )
      .end(bytes);
  });
}