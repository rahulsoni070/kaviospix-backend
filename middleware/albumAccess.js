const mongoose = require("mongoose");
const Album = require("../models/Album");

const albumAccess = (level = "read") => {
  return async (req, res, next) => {
    try {
      const { albumId } = req.params;

      if (!mongoose.isValidObjectId(albumId)) {
        return res.status(400).json({ message: "Invalid album id" });
      }

      const album = await Album.findById(albumId);

      if (!album) {
        return res.status(404).json({ message: "Album not found" });
      }

      const isOwner = album.ownerId.toString() === req.user._id.toString();
      const isShared = album.sharedWith.includes(req.user.email);

      if (level === "owner" && !isOwner) {
        return res.status(403).json({ message: "Only the owner can do this" });
      }

      if (level === "read" && !isOwner && !isShared) {
        return res.status(403).json({ message: "You don't have access to this album" });
      }

      req.album = album;
      req.isOwner = isOwner;

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { albumAccess };