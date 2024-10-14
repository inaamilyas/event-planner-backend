import { Router } from "express";
import { changeVenueStaus, getVenuesForApprove } from "../controllers/admin.controller.js";

const router = Router();

router.get("/", getVenuesForApprove);
router.post("/venue/change-status", changeVenueStaus);

export default router;
