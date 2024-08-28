import { Router } from "express";

import { login, signup, updateProfile, getUserInformation } from "../controllers/user.controllers.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-profile", updateProfile);

router.post("/info", getUserInformation);

export default router;
