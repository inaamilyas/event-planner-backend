import { Router } from "express";
import {
  acceptBookingRequest,
  createBooking,
  getAllVenues,
  createVenue,
  deleteBooking,
  deleteVenue,
  getBookingById,
  getVenueById,
  showAllBookingRequests,
  suggestNearestVenues,
  suggestVenuesBasedOnWeather,
  updateBooking,
  updateVenue,
} from "../controllers/venue.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllVenues);
router.post("/", upload.single("picture"), createVenue);
router.put("/", updateVenue);
router.delete("/", deleteVenue);
router.get("/:venue-id", getVenueById);

router.post("/booking/:venue-id", createBooking);
router.put("/booking/:venue-id", updateBooking);
router.delete("/booking/:venue-id", deleteBooking);
router.get("/booking/:venue-id", getBookingById);
router.post("/booking/accept/:venue-id", acceptBookingRequest);

router.post("/booking/requests", showAllBookingRequests);

router.post("/venues/suggest/nearest", suggestNearestVenues);
router.post("/venues/suggest/weather", suggestVenuesBasedOnWeather);

export default router;
