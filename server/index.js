import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("DB connection failed:", error);
    process.exit(1);
  }
}

startServer();