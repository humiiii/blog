const express = require("express");
const imagekit = require("../utils/imagekit");
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const response = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "/blog-uploads/",
    });

    res.json({ url: response.url });
  } catch (err) {
    console.error("ImageKit upload error:", err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;
