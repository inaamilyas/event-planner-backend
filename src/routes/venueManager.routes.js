import { Router } from "express";

import { signup, login, updateProfile } from "../controllers/venueManager.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-profile", updateProfile);

export default router;
