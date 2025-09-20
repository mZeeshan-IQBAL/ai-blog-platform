// models/Post.js — upgraded with slug support
import mongoose, { Schema, model, models } from "mongoose";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const ReactionSchema = new Schema({
  type: { type: String, enum: ["like", "love", "fire"], required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },
    tags: [{ type: String, lowercase: true, trim: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coAuthors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    series: { type: String, trim: true, default: "" },
    coverImage: { type: String, default: "" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [ReactionSchema],
    views: { type: Number, default: 0 },
    reads: { type: Number, default: 0 },
    readMs: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    scheduledAt: { type: Date },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PostSchema.pre("save", async function (next) {
  this.updatedAt = new Date();
  if (!this.isModified("title") && this.slug) return next();

  let base = slugify(this.title || "post");
  if (!base) base = Math.random().toString(36).slice(2, 8);

  // Ensure uniqueness by appending incrementing suffix if needed
  let candidate = base;
  let i = 1;
  while (
    await (models.Post || mongoose.model("Post")).exists({ slug: candidate, _id: { $ne: this._id } })
  ) {
    candidate = `${base}-${i++}`;
  }
  this.slug = candidate;
  next();
});

// ✅ Virtual for like count
PostSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

// ✅ Prevent recompiling model on hot reload
const Post = models.Post || model("Post", PostSchema);

export default Post;
