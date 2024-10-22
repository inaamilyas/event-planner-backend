import { Router } from "express";

import {
  login,
  signup,
  updateProfile,
  getUserInformation,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/update-profile", upload.single("picture"), updateProfile);

router.post("/info", getUserInformation);

export default router;
