const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const {
  getPhotos,
  uploadPhoto,
  deletePhoto
} = require("../controllers/photoController");

const {
  getComments,
  addComment
} = require("../controllers/commentController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get("/", getPhotos);
router.post("/upload", upload.single("photo"), uploadPhoto);
router.delete("/:id", deletePhoto);
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);

module.exports = router;
