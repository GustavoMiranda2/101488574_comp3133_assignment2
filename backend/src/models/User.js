
//Name: Gustavo Miranda
//Student ID: 101488574


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    collection: "Users",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

module.exports = mongoose.model("User", userSchema);
