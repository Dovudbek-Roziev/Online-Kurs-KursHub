const fs = require("fs");
const cloudinary = require("../config/cloudinary");

function buildOptimizedAssetUrl(publicId, resourceType) {
  if (resourceType === "video") {
    return cloudinary.url(publicId, {
      resource_type: "video",
      secure: true,
      format: "mp4",
      transformation: [
        { quality: "auto:eco", fetch_format: "mp4", width: 1280, crop: "limit" }
      ]
    });
  }

  return cloudinary.url(publicId, {
    resource_type: "image",
    secure: true,
    transformation: [
      { fetch_format: "auto", quality: "auto:good", width: 1600, crop: "limit" }
    ]
  });
}

function uploadFileToCloudinary(filePath, folder, resourceType = "image") {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true
      },
      (error, result) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        if (error) return reject(error);

        resolve({
          ...result,
          optimizedUrl: buildOptimizedAssetUrl(result.public_id, resourceType)
        });
      }
    );
  });
}

module.exports = uploadFileToCloudinary;
