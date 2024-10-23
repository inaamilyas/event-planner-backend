import { Router } from "express";
import {
  createBooking,
  getAllVenues,
  createVenue,
  deleteVenue,
  getVenueById,
  updateVenue,
  getUserBookings
} from "../controllers/venue.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllVenues);
router.post("/", upload.single("picture"), createVenue);
router.put("/:id", upload.single("picture"), updateVenue);
router.delete("/:id", deleteVenue);
router.get("/:id", getVenueById);

router.get("/booking/get-all-bookings", getUserBookings);
router.post("/booking/:venue_id", createBooking);


export default router;
