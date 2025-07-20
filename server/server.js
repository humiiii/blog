import "dotenv/config";

import express from "express";
import cors from "cors";
import connectDB from "./connect.js";

// Routes
import authRoute from "./routes/auth.js";
import uploadRoute from "./routes/imagekitAuth.js";
import blogRoute from "./routes/blog.js";
import searchRoute from "./routes/search.js";

// Initialize database
connectDB();

// Initialize app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Route middleware
app.use("/api/auth", authRoute);
app.use("/api/image", uploadRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/search", searchRoute);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on port: ${PORT}`);
});
