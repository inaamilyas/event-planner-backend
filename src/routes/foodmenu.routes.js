import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  // getFoodItemsByVenue,
  addFoodItemForVenue,
  updateFoodItemForVenue,
  deleteFoodItemForVenue,
  saveFoodItemsForBooking
} from "../controllers/foodmenu.controllers.js";

const router = Router();

// router.get("/:venue_id", getFoodItemsByVenue);
router.post("/:venue_id", upload.single("picture"), addFoodItemForVenue);
router.put("/:id", upload.single("picture"), updateFoodItemForVenue);
router.delete("/:id", deleteFoodItemForVenue);
router.post("/order/save", saveFoodItemsForBooking);

export default router;
