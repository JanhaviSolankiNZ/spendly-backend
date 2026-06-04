import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoute";
import expenseRoutes from "./routes/expenseRoute";
import incomeRoutes from "./routes/incomeRoute";
import { protect } from "./middleware/authMiddleware";

const server = express();
server.use(express.json({ limit: "10mb" }));
server.use(express.urlencoded({ extended: true, limit: "10kb" }));
server.use(cookieParser());
server.use(helmet());
server.use(
  cors({
    origin: process.env.CLIENT_URL, // FE URL
    credentials: true // Allow cookies
  })
);

if (process.env.NODE_ENV === "development") {
  server.use(morgan("dev"));
}

server.use("/api/auth",authRoutes);
server.use("/api/expense", protect, expenseRoutes);
server.use("/api/income", protect, incomeRoutes);
connectDB();

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});