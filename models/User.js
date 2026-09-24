const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    name:     { type: String },
    avatar:   { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);