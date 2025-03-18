require("dotenv").config();
const mongoose = require("mongoose");

// 🔹 Define MongoDB connection string (update if needed)
const MONGO_URI = "mongodb+srv://janquijano:4QkAuT3uGdlRPjDx@cluster0.nu0mp.mongodb.net/review_app";

// 🔹 Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Handle errors
db.on("error", console.error.bind(console, "❌ MongoDB Connection Error:"));
db.once("open", async () => {
  console.log("✅ Connected to MongoDB!");

  // 🔹 Define User Schema (match the structure of your collection)
  const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: String,
    description: String,
    userType: String, // "user" or "reviewer"
  });

  const User = mongoose.model("User", userSchema, "users"); // Specify "users" collection

  try {
    // 🔹 Fetch a specific user (Change username as needed)
    const usernameToFind = "john_doe";
    const user = await User.findOne({ username: usernameToFind });

    if (user) {
      console.log("🔍 User Found:", user);
    } else {
      console.log("⚠️ User not found:", usernameToFind);
    }
  } catch (err) {
    console.error("❌ Error fetching user:", err);
  } finally {
    mongoose.connection.close(); // Close connection after fetching
  }
});
