//Name: Gustavo Miranda
//Student ID: 101488574

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadEmployeePhoto(imageData) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials are missing in .env file.");
  }

  const result = await cloudinary.uploader.upload(imageData, {
    folder: process.env.CLOUDINARY_FOLDER || "comp3133_assignment1_employees"
  });

  return result.secure_url;
}

module.exports = uploadEmployeePhoto;
