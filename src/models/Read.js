// models/Read.js
import mongoose from "mongoose";

const ReadSchema = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  ms: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Read || mongoose.model("Read", ReadSchema);
