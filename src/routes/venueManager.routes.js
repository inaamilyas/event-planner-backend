import { Router } from "express";

import { signup, login, updateProfile } from "../controllers/venueManager.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-profile",upload.single("picture"), updateProfile);

export default router;
