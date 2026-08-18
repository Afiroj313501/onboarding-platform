import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import taskRoutes from "./routes/task.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Protected test route
app.get("/api/profile", authMiddleware, (req: any, res) => {
  res.json({
    message: "This is a protected route",
    user: req.user
  });
});

app.get("/", (req, res) => {
  res.send("AI Onboarding Platform API is running...");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});