import { Router } from "express";
import {
  createBooking,
  getAllVenues,
  createVenue,
  deleteVenue,
  // suggestNearestVenues,
  // suggestVenuesBasedOnWeather,
  updateVenue,
} from "../controllers/venue.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllVenues);
router.post("/", upload.single("picture"), createVenue);
router.put("/:id",upload.single("picture"), updateVenue);
router.delete("/:id", deleteVenue);

router.post("/booking/:venue_id", createBooking);


// router.get("/:venue_id", getVenueById);
// router.put("/booking/:venue_id", updateBooking);
// router.delete("/booking/:venue_id", deleteBooking);
// router.get("/booking/:venue_id", getBookingById);
// router.post("/booking/accept/:venue_id", acceptBookingRequest);

// router.post("/booking/requests", showAllBookingRequests);

// router.post("/suggest/nearest", suggestNearestVenues);
// router.post("/suggest/weather", suggestVenuesBasedOnWeather);

export default router;
