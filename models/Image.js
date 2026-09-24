const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text:   { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

const imageSchema = new mongoose.Schema(
  {
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true
    },

    name:     { type: String, required: true },
    imageUrl: { type: String, required: true },
    publicId: { type: String },

    tags:       [{ type: String, lowercase: true, trim: true }],
    person:     { type: String },
    isFavorite: { type: Boolean, default: false },

    comments: [commentSchema],

    size:       { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

imageSchema.index({ albumId: 1, uploadedAt: -1 });
imageSchema.index({ albumId: 1, isFavorite: 1 });
imageSchema.index({ albumId: 1, tags: 1 });

module.exports = mongoose.model("Image", imageSchema);