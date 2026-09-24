const Image = require("../models/Image");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const uploadImage = async (req, res) => {
  let uploaded;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please attach an image in the 'image' field" });
    }

    uploaded = await uploadToCloudinary(req.file.buffer);

    const { tags, person, isFavorite } = req.body;

    const tagList = tags
      ? tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const image = await Image.create({
      albumId:    req.album._id,
      name:       req.file.originalname,
      imageUrl:   uploaded.secure_url,
      publicId:   uploaded.public_id,
      size:       req.file.size,
      tags:       tagList,
      person:     person?.trim() || undefined,
      isFavorite: isFavorite === "true"
    });

    res.status(201).json(image);
  } catch (error) {
    if (uploaded?.public_id) {
      await deleteFromCloudinary(uploaded.public_id).catch(() => {});
    }
    res.status(500).json({ message: error.message });
  }
};

const getImages = async (req, res) => {
  try {
    const filter = { albumId: req.album._id };

    // Tag search (partial match):
    //   ?tags=bea      -> tags that START WITH "bea" (beach, beauty...)
    //   ?tags=bea,sun  -> tags starting with "bea" OR "sun"
    // Tags are saved in lowercase, so the search text is lowercased too.
    const { tags } = req.query;
    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (tagList.length > 0) {
        filter.tags = {
          $in: tagList.map((t) => new RegExp("^" + escapeRegex(t)))
        };
      }
    }

    // Pagination: ?page=1&limit=20 (limit is kept between 1 and 50)
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const skip = (page - 1) * limit;

    const [images, total] = await Promise.all([
      Image.find(filter)
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("comments.userId", "name avatar"),
      Image.countDocuments(filter)
    ]);

    res.status(200).json({
      images,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFavoriteImages = async (req, res) => {
  try {
    const images = await Image.find({
      albumId: req.album._id,
      isFavorite: true
    })
      .sort({ uploadedAt: -1 })
      .populate("comments.userId", "name avatar");

    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { isFavorite } = req.body;

    if (typeof isFavorite !== "boolean") {
      return res.status(400).json({ message: "isFavorite must be true or false" });
    }

    req.image.isFavorite = isFavorite;
    await req.image.save();

    res.status(200).json(req.image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ message: "comment must be a non-empty string" });
    }

    if (comment.trim().length > 500) {
      return res.status(400).json({ message: "comment must be 500 characters or less" });
    }

    req.image.comments.push({
      text: comment.trim(),
      userId: req.user._id
    });

    await req.image.save();
    await req.image.populate("comments.userId", "name avatar");
    const newComment = req.image.comments[req.image.comments.length - 1];

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = req.image;

    await image.deleteOne();

    if (image.publicId) {
      try {
        await deleteFromCloudinary(image.publicId);
      } catch (cloudError) {
        console.error("Cloudinary delete failed:", image.publicId, cloudError.message);
      }
    }

    res.status(200).json({
      message: "Image deleted",
      imageId: image._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadImage, getImages, getFavoriteImages, toggleFavorite, addComment, deleteImage };