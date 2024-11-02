import express from "express";
import cors from "cors";
import userRoutes from "./src/routes/user.routes.js";
import venueRoutes from "./src/routes/venue.routes.js";
import foodMenuRoutes from "./src/routes/foodmenu.routes.js";
import eventRoutes from "./src/routes/event.routes.js";
import venueManagerRoutes from "./src/routes/venueManager.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import feedbackRoutes from "./src/routes/feedback.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import admin from "firebase-admin";

const app = express();

// Middleware
// Increase the limit for JSON and URL-encoded request bodies
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.urlencoded({ extended: true }));

// Initialize FCM
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Use applicationDefault to read from the env variable
});

// Serve static files from the public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// All Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/venues", venueRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/venue-manager", venueManagerRoutes);
app.use("/api/v1/food-menu", foodMenuRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/feedback", feedbackRoutes);

// running server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running at port", PORT);
});
