import express from "express";
import multer from "multer";
import imagekit from "../utils/imagekit.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route POST /upload-image
 * @desc Handles image upload and storage to ImageKit.
 * @access Private
 */

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please attach an image.",
      });
    }
    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, //
      fileName: req.file.originalname,
      folder: "/blog-uploads/",
    });

    return res.status(200).json({
      success: true,
      url: uploadResponse.url,
      message: "Image uploaded successfully.",
    });
  } catch (error) {
    console.error("[ImageKit Upload Error]:", error);

    return res.status(500).json({
      success: false,
      error:
        "An error occurred while uploading the image. Please try again later.",
    });
  }
});

export default router;
