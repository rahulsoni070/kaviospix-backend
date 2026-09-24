const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sharedWith: [{ type: String, lowercase: true }]
  },
  { timestamps: true }
);

albumSchema.index({ ownerId: 1 });
albumSchema.index({ sharedWith: 1 });

module.exports = mongoose.model("Album", albumSchema);