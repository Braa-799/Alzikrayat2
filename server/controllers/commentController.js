const Comment = require("../models/Comment");
const Photo = require("../models/Photo");
const User = require("../models/User");

const getComments = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const comments = await Comment.find({ photoId: req.params.id })
      .populate("userId", "firstName lastName")
      .sort({ dateTime: 1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { comment, userId } = req.body;

    if (!comment || !comment.trim() || !userId) {
      return res.status(400).json({
        message: "Comment and user ID are required"
      });
    }

    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newComment = await Comment.create({
      photoId: photo._id,
      userId: user._id,
      comment: comment.trim()
    });

    const result = await newComment.populate("userId", "firstName lastName");

    res.status(201).json({
      message: "Comment added successfully",
      comment: result
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add comment",
      error: error.message
    });
  }
};

module.exports = { getComments, addComment };
