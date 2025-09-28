// src/models/Post.js
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

const ReactionSchema = new Schema(
  {
    type: { type: String, enum: ["like", "love", "fire"], required: true },
    user: { type: String, required: true }, // OAuth user ID
  },
  { _id: false }
);

const PostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    summary: { type: String, default: "" },

    // 🔹 Editor & publishing status
    status: { type: String, enum: ["draft", "published", "archived"], default: "published", index: true },

    // 🔹 Engagement
    tags: [{ type: String, lowercase: true, trim: true }],
    category: { type: String, trim: true, default: "General" },

    // 🔹 Author info (snapshot for UI speed)
    authorId: { type: String, required: true }, // internal user id string
    authorName: { type: String, required: true },
    authorImage: { type: String, default: "" },

    coAuthors: [{ type: String }],
    series: { type: String, trim: true, default: "" },
    coverImage: { type: String, default: "" },

    // 🔹 Reactions & Engagement
    likes: [{ type: String }],
    reactions: [ReactionSchema],
    views: { type: Number, default: 0 },
    reads: { type: Number, default: 0 },
    readMs: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // 🔹 Publishing
    published: { type: Boolean, default: true }, // kept for backward compatibility
    scheduledAt: { type: Date },
    // 🔹 Soft delete
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, default: "" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],

    // 🔹 SEO fields
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slug generation
PostSchema.pre("save", async function (next) {
  this.updatedAt = new Date();
  if (!this.isModified("title") && this.slug) return next();

  let base = slugify(this.title || "post");
  if (!base) base = Math.random().toString(36).slice(2, 8);

  let candidate = base;
  let i = 1;
  while (
    await (models.Post || mongoose.model("Post")).exists({
      slug: candidate,
      _id: { $ne: this._id },
    })
  ) {
    candidate = `${base}-${i++}`;
  }
  this.slug = candidate;
  next();
});

// Keep published boolean consistent with status/schedule
PostSchema.pre("save", function (next) {
  const now = new Date();
  if (this.status === "draft" || this.status === "archived") {
    this.published = false;
  } else if (this.status === "published") {
    // If scheduled in the future, mark unpublished until due
    if (this.scheduledAt && new Date(this.scheduledAt) > now) {
      this.published = false;
    } else {
      this.published = true;
    }
  }
  this.updatedAt = now;
  next();
});

// Virtuals
PostSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

// Recompile on hot-reload
if (models.Post) {
  delete models.Post;
}

const Post = model("Post", PostSchema);
export default Post;
