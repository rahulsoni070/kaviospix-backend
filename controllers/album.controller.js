const Album = require("../models/Album");
const Image = require("../models/Image");
const User = require("../models/User");
const { deleteFromCloudinary } = require("../config/cloudinary");

const createAlbum = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Album name is required" });
    }

    const album = await Album.create({
      name,
      description,
      ownerId: req.user._id
    });

    res.status(201).json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlbums = async (req, res) => {
  try {
    const albums = await Album.find({
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user.email }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateAlbum = async (req, res) => {
  try {
    const { description } = req.body;

    if (description !== undefined) {
      req.album.description = description;
    }

    await req.album.save();
    res.status(200).json(req.album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const album = req.album;

    const images = await Image.find({ albumId: album._id }).select("publicId");
    const publicIds = images.map((img) => img.publicId).filter(Boolean);

    const result = await Image.deleteMany({ albumId: album._id });

    await album.deleteOne();

    const cloudResults = await Promise.allSettled(
      publicIds.map((id) => deleteFromCloudinary(id))
    );

    const failed = cloudResults.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error(`Cloudinary: ${failed} file(s) failed to delete for album ${album._id}`);
    }

    res.status(200).json({
      message: "Album deleted",
      albumId: album._id,
      imagesDeleted: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const shareAlbum = async (req, res) => {
  try {
    const album = req.album;
    const { albumId } = req.params;
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "emails must be a non-empty array" });
    }

    const cleanEmails = [...new Set(emails.map((e) => String(e).trim().toLowerCase()))];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = cleanEmails.filter((e) => !emailRegex.test(e));
    if (invalid.length > 0) {
      return res.status(400).json({ message: "Invalid email format", invalid });
    }

    if (cleanEmails.includes(req.user.email)) {
      return res.status(400).json({ message: "You already own this album" });
    }

    const users = await User.find({ email: { $in: cleanEmails } }).select("email");
    const foundEmails = users.map((u) => u.email);
    const notFound = cleanEmails.filter((e) => !foundEmails.includes(e));

    if (notFound.length > 0) {
      return res.status(404).json({ message: "Some users are not registered", notFound });
    }

    album.sharedWith.addToSet(...cleanEmails);
    await album.save();

    res.status(200).json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlbumById = async (req, res) => {
  try {
    await req.album.populate("ownerId", "name email avatar");

    const imageCount = await Image.countDocuments({ albumId: req.album._id });

    res.status(200).json({
      ...req.album.toObject(),
      imageCount,
      isOwner: req.isOwner
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAlbum, getAlbums, updateAlbum, deleteAlbum, shareAlbum, getAlbumById };