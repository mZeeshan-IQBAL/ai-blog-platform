// models/Comment.js — with status and reactions
import { Schema, model, models } from "mongoose";

const ReactionSchema = new Schema({
  type: { type: String, enum: ["like", "love", "fire"], required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });

const CommentSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  parentComment: { type: Schema.Types.ObjectId, ref: "Comment" }, // thread replies
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  reactions: [ReactionSchema],
  status: { type: String, enum: ["approved", "pending", "flagged"], default: "approved" },
  createdAt: { type: Date, default: Date.now },
});

const Comment = models.Comment || model("Comment", CommentSchema);
export default Comment;
