import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import corsOptions from "./src/config/cors.js";
import authRoutes from "./src/routes/auth.route.js";
import spotifyRoutes from "./src/routes/spotify.route.js";
import listRoutes from "./src/routes/list.route.js";
import reviewRoutes from "./src/routes/review.route.js";
import profileRoutes from "./src/routes/profile.route.js";
import errorHandler from "./src/middlewares/errorHandler.js";


const app = express();
const PORT = process.env.PORT;
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use("/api/auth", authRoutes);
app.use("/api", spotifyRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/profiles", profileRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server di http://localhost:${PORT}`);
});
