import { Router } from "express";

import { login, signup, updateProfile } from "../controllers/user.controllers.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-profile", updateProfile);

export default router;
