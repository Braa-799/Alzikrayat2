const Photo = require("../models/Photo");

const getPhotos = async (req, res) => {
  try {
    const photos = await Photo.find()
      .populate("userId", "firstName lastName")
      .sort({ dateTime: -1 });

    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch photos",
      error: error.message
    });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        message: "Photo file is required"
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required"
      });
    }

    const photo = await Photo.create({
      userId,
      fileName: req.file.filename,
      title: title.trim(),
      description: description || "",
      dateTime: new Date()
    });

    res.status(201).json({
      message: "Photo uploaded successfully",
      photo
    });
  } catch (error) {
    res.status(500).json({
      message: "Photo upload failed",
      error: error.message
    });
  }
};

const deletePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({
        message: "Photo not found"
      });
    }

    if (photo.userId.toString() !== userId) {
      return res.status(403).json({
        message: "You can only delete your own photos"
      });
    }

    await photo.deleteOne();

    res.status(200).json({
      message: "Photo deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Photo deletion failed",
      error: error.message
    });
  }
};

module.exports = {
  getPhotos,
  uploadPhoto,
  deletePhoto
};
