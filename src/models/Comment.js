// src/models/Comment.js
import { Schema, model, models } from "mongoose";

const ReactionSchema = new Schema({
  type: { type: String, enum: ["like", "love", "fire"], required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });

const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true }, // <--- THIS is critical
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: "Comment" }, // for replies
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  reactions: [ReactionSchema],
  status: { type: String, enum: ["approved", "pending", "flagged"], default: "approved" },
}, { timestamps: true });

const Comment = models.Comment || model("Comment", CommentSchema);
export default Comment;