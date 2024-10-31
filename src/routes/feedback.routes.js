import { Router } from "express";
import { saveFeedback } from "../controllers/feedback.controller.js";

const router = Router();

router.post("/", saveFeedback);

export default router;
