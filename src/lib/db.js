// lib/db.js
import mongoose from "mongoose";

let isConnected = false; // track connection

export async function connectToDB() {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB already connected");
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
