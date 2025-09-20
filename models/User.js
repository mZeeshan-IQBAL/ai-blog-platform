// models/User.js — extended with bookmarks and follows
import { Schema, model, models } from "mongoose";

// User schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String }, // optional, non-hashed for demo
  image: { type: String },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  follows: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model("User", UserSchema);
export default User;
