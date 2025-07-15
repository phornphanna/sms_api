const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png'];
  
    if (!allowedExts.includes(ext)) {
      return cb(new Error("Unsupported file type"), false);
    }
  
    // Save to outside the src folder: /api/uploads
    const uploadPath = path.join(__dirname, '../../uploads');
  
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (err) {
      cb(new Error(`Failed to create directory: ${err.message}`), false);
    }
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}${ext}`;
    cb(null, name);
  },
});

// 2. File Filter
const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(file.mimetype) && [".jpg", ".jpeg", ".png"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG files are allowed"), false);
  }
};

// 3. Multer Configuration
const rawUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});

// 4. Wrapped Middleware (Handles Multer Errors Here)
const uploadImage = (req, res, next) => {
  rawUpload.single("image")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Max 1MB allowed." });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Unexpected field." });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    next();
  });
};

module.exports = uploadImage;
