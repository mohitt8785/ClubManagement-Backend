import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./Config/db.js";
import entryRoutes from "./Routes/Entry.Route.js";

const app = express();

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/entries", entryRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎯 Jaguar Club API is running!",
    version: "1.0.0",
    endpoints: { entries: "/api/entries" },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Server   : http://localhost:${PORT}`);
  console.log(`📡 API      : http://localhost:${PORT}/api/entries`);
  console.log(`🌐 Frontend : ${process.env.CLIENT_URL}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});