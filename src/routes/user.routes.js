import { Router } from "express";

import { signup } from "../controllers/user.controllers.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", signup);
router.post("/update-profile", signup);

export default router;
