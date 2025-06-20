import express from "express";
import { createEvent, deleteEvent, updateEvent } from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = express.Router();

// Event routes
router.post("/", upload.single("picture"), createEvent); 
router.put("/:id", upload.single("picture"), updateEvent); 
router.delete("/:id", deleteEvent);
// router.get("/:id", getEventById); 
// router.get("/", listUserEvents); 

export default router;
