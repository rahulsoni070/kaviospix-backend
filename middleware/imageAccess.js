const mongoose = require("mongoose");
const Image = require("../models/Image");

const loadImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    if (!mongoose.isValidObjectId(imageId)) {
      return res.status(400).json({ message: "Invalid image id" });
    }

    const image = await Image.findOne({
      _id: imageId,
      albumId: req.album._id
    });

    if (!image) {
      return res.status(404).json({ message: "Image not found in this album" });
    }

    req.image = image;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loadImage };