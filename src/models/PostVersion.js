// src/models/PostVersion.js
import mongoose, { Schema, model, models } from "mongoose";

const PostVersionSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    version: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },
    tags: [{ type: String }],
    category: { type: String, default: "General" },
    coverImage: { type: String, default: "" },
    authorId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

PostVersionSchema.index({ postId: 1, version: -1 }, { unique: true });

const PostVersion = models.PostVersion || model("PostVersion", PostVersionSchema);
export default PostVersion;