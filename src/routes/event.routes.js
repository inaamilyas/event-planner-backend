import express from "express";
import { createEvent, deleteEvent, getEventById, listUserEvents, updateEvent } from "../controllers/event.controller.js";


const router = express.Router();

// Event routes
router.post("/events", createEvent); 
router.put("/events/:id", updateEvent); 
router.get("/events/:id", getEventById); 
router.delete("/events/:id", deleteEvent);
router.get("/events/user/:userId", listUserEvents); 

export default router;
