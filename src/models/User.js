// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  
  // OAuth provider info
  provider: { type: String },
  providerId: { type: String, unique: true },
  
  // Social features
  follows: [{ type: String }], // Array of providerIds that this user follows
  followers: [{ type: String }], // Array of providerIds that follow this user
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Add this line
  
  // Additional user info
  bio: { type: String },
  website: { type: String },
  location: { type: String },
  
  // Account status
  verified: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update timestamp on save
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Prevent recompilation during development
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;