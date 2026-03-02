import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("☁️ Cloudinary configured:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing",
});

// ✅ File Filter
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  console.log("📎 File filter check:", file.fieldname, file.mimetype);
  
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP images allowed!"), false);
  }
};

// ✅ Live Photo Storage (Passport size)
const livePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("📸 Uploading livePhoto to Cloudinary...");
    return {
      folder: "Jaguar_Club/live_photos",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 350, height: 450, crop: "fill" }],
      public_id: `live_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  },
});

// ✅ ID Front Storage
const idFrontStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("🪪 Uploading idFront to Cloudinary...");
    return {
      folder: "Jaguar_Club/id_front",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 500, crop: "fill" }],
      public_id: `front_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  },
});

// ✅ ID Back Storage
const idBackStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("🪪 Uploading idBack to Cloudinary...");
    return {
      folder: "Jaguar_Club/id_back",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 500, crop: "fill" }],
      public_id: `back_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  },
});

// ✅ Combined Upload Middleware
const upload = multer({
  storage: multer.memoryStorage(), // Temporary in-memory storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).fields([
  { name: "livePhoto", maxCount: 1 },
  { name: "idFront", maxCount: 1 },
  { name: "idBack", maxCount: 1 },
]);

// ✅ Manual Cloudinary Upload Function
const uploadToCloudinary = async (file, folder, transformation) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `Jaguar_Club/${folder}`,
        transformation,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error(`❌ Cloudinary upload error (${folder}):`, error);
          reject(error);
        } else {
          console.log(`✅ Uploaded to ${folder}:`, result.secure_url);
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

export default upload;
export { uploadToCloudinary, cloudinary };