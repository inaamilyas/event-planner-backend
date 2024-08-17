import { PrismaClient } from "@prisma/client";
import axios from "axios";
import path from "path";
import getAddressbyCoordinates from "../utils/getAddressByCoordinates.js";

const prisma = new PrismaClient();

const getAllVenues = async (req, res) => {
  try {
    const venues = await prisma.Venues.findMany({
      where: {
        owner_id: 3,
      },
    });
    
    // Update the picture paths to URLs
    const updatedVenues = venues.map((venue) => {
      return {
        ...venue,
        picture: `/venues/${path.basename(venue.picture)}`,
      };
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue fetched successfully",
      data: updatedVenues,
    });
  } catch (error) {
    console.error("Error creating venue: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

const createVenue = async (req, res) => {
  console.log("inside create venue");
  const { name, about, latitude, longitude, phone } = req.body;

  const owner = await prisma.VenueManagers.findFirst({
    where: {
      email: "inam@inam.com",
    },
  });

  try {
    // Get the image file path from req.file
    const imagePath = req.file ? req.file.path : null;

    const address = await getAddressbyCoordinates(latitude, longitude);

    const newVenue = await prisma.Venues.create({
      data: {
        name,
        address,
        about,
        picture: imagePath,
        latitude: parseFloat(latitude),
        owner_id: owner.id,
        longitude: parseFloat(longitude),
        phone: phone.toString(),
      },
    });
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue created successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error creating venue: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

const getVenueById = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const venueId = parseInt(id, 10);
  if (isNaN(venueId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid venue ID",
    });
  }

  try {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Venue not found",
      });
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue retrieved successfully",
      data: venue,
    });
  } catch (error) {
    console.error("Error retrieving venue: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateVenue = async (req, res) => {
  const { id } = req.params;
  const { name, address, capacity, description } = req.body;

  // 1. Validate ID format
  const venueId = parseInt(id, 10);
  if (isNaN(venueId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid venue ID",
    });
  }

  // 2. Check for empty fields
  if (!name || !address || !capacity) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Name, address, and capacity are required",
    });
  }

  // 3. Validate name and address format
  if (typeof name !== "string" || typeof address !== "string") {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Name and address must be strings",
    });
  }

  // 4. Validate capacity
  if (!Number.isInteger(capacity) || capacity <= 0) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Capacity must be a positive integer",
    });
  }

  // 5. Validate description format
  if (description && typeof description !== "string") {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Description must be a string",
    });
  }

  try {
    const updatedVenue = await prisma.venue.update({
      where: { id: venueId },
      data: {
        name,
        address,
        capacity,
        description,
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue updated successfully",
      data: updatedVenue,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for "Record not found"
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Venue not found",
      });
    }
    console.error("Error updating venue: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteVenue = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const venueId = parseInt(id, 10);
  if (isNaN(venueId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid venue ID",
    });
  }

  try {
    await prisma.venue.delete({
      where: { id: venueId },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for "Record not found"
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Venue not found",
      });
    }
    console.error("Error deleting venue: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const createBooking = async (req, res) => {
  const { venueId, userId, bookingDate, startTime, endTime, status } = req.body;

  // 1. Check for empty fields
  if (
    !venueId ||
    !userId ||
    !bookingDate ||
    !startTime ||
    !endTime ||
    !status
  ) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "All fields are required",
    });
  }

  // 2. Validate venueId and userId
  if (!Number.isInteger(venueId) || !Number.isInteger(userId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid venue or user ID",
    });
  }

  // 3. Validate bookingDate, startTime, and endTime formats
  if (
    isNaN(Date.parse(bookingDate)) ||
    isNaN(Date.parse(startTime)) ||
    isNaN(Date.parse(endTime))
  ) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid date format",
    });
  }

  // 4. Validate status
  const validStatuses = ["confirmed", "pending", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid status value",
    });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: {
        venueId,
        userId,
        bookingDate: new Date(bookingDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
      },
    });
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const getBookingById = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid booking ID",
    });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { venue: true, user: true },
    });

    if (!booking) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Booking not found",
      });
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Booking retrieved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error retrieving booking: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateBooking = async (req, res) => {
  const { id } = req.params;
  const { venueId, userId, bookingDate, startTime, endTime, status } = req.body;

  // 1. Validate ID format
  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid booking ID",
    });
  }

  // 2. Check for empty fields
  if (
    !venueId ||
    !userId ||
    !bookingDate ||
    !startTime ||
    !endTime ||
    !status
  ) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "All fields are required",
    });
  }

  // 3. Validate venueId and userId
  if (!Number.isInteger(venueId) || !Number.isInteger(userId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid venue or user ID",
    });
  }

  // 4. Validate bookingDate, startTime, and endTime formats
  if (
    isNaN(Date.parse(bookingDate)) ||
    isNaN(Date.parse(startTime)) ||
    isNaN(Date.parse(endTime))
  ) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid date format",
    });
  }

  // 5. Validate status
  const validStatuses = ["confirmed", "pending", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid status value",
    });
  }

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        venueId,
        userId,
        bookingDate: new Date(bookingDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for "Record not found"
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Booking not found",
      });
    }
    console.error("Error updating booking: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const bookingId = parseInt(id, 10);
  if (isNaN(bookingId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid booking ID",
    });
  }

  try {
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Booking deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for "Record not found"
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Booking not found",
      });
    }
    console.error("Error deleting booking: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const acceptBookingRequest = async (req, res) => {
  const { bookingId } = req.params;
  const { userId } = req.body; // Assuming this is the ID of the venue owner making the request

  // 1. Validate ID format
  const bookingIdInt = parseInt(bookingId, 10);
  if (isNaN(bookingIdInt)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid booking ID",
    });
  }

  // 2. Validate user ID
  if (!Number.isInteger(userId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid user ID",
    });
  }

  try {
    // 3. Fetch the booking and associated venue
    const booking = await prisma.booking.findUnique({
      where: { id: bookingIdInt },
      include: { venue: true },
    });

    if (!booking) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Booking not found",
      });
    }

    // 4. Check if the user is the owner of the venue
    if (booking.venue.userId !== userId) {
      return res.status(403).json({
        code: 403,
        status: "error",
        message: "You are not authorized to accept this booking",
      });
    }

    // 5. Update the booking status to "confirmed"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingIdInt },
      data: { status: "confirmed" },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Booking request accepted successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error accepting booking request: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const showAllBookingRequests = async (req, res) => {
  const { userId } = req.body; // Assuming this is the ID of the venue owner making the request

  // 1. Validate user ID
  if (!Number.isInteger(userId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid user ID",
    });
  }

  try {
    // 2. Fetch all venues owned by the user
    const venues = await prisma.venue.findMany({
      where: { userId },
      select: { id: true },
    });

    if (venues.length === 0) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "No venues found for this user",
      });
    }

    // 3. Fetch all bookings for the venues owned by the user
    const bookings = await prisma.booking.findMany({
      where: {
        venueId: {
          in: venues.map((venue) => venue.id),
        },
      },
      include: {
        venue: true,
        user: true, // Assuming you want to include user information
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Error retrieving booking requests: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const suggestNearestVenues = async (req, res) => {
  const { latitude, longitude } = req.body;

  // 1. Validate latitude and longitude
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Latitude and longitude must be numbers",
    });
  }

  try {
    // 2. Fetch all venues with their coordinates
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    // 3. Calculate distance using the Haversine formula
    const haversine = (lat1, lon1, lat2, lon2) => {
      const toRad = (angle) => (Math.PI / 180) * angle;
      const R = 6371; // Radius of the Earth in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    // 4. Map venues with calculated distances
    const venuesWithDistance = venues.map((venue) => ({
      ...venue,
      distance: haversine(latitude, longitude, venue.latitude, venue.longitude),
    }));

    // 5. Sort venues by distance
    venuesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Nearest venues retrieved successfully",
      data: venuesWithDistance,
    });
  } catch (error) {
    console.error("Error suggesting nearest venues: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const suggestVenuesBasedOnWeather = async (req, res) => {
  const { latitude, longitude } = req.body;

  // 1. Validate latitude and longitude
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Latitude and longitude must be numbers",
    });
  }

  try {
    // 2. Fetch weather data using a weather API
    const weatherApiKey = "YOUR_WEATHER_API_KEY"; // Replace with your Weather API key
    const weatherResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}`
    );
    const weatherData = weatherResponse.data;

    const currentCondition = weatherData.current.condition.text.toLowerCase();

    // 3. Determine venue type preference based on weather
    let preferredVenueTypes;
    if (
      currentCondition.includes("rain") ||
      currentCondition.includes("storm")
    ) {
      preferredVenueTypes = ["indoor"]; // Suggest indoor venues for rainy or stormy weather
    } else if (
      currentCondition.includes("sunny") ||
      currentCondition.includes("clear")
    ) {
      preferredVenueTypes = ["outdoor", "indoor"]; // Suggest outdoor or indoor venues for sunny weather
    } else {
      preferredVenueTypes = ["indoor", "outdoor"]; // Default to suggesting both types
    }

    // 4. Fetch venues based on the preferred venue types
    const venues = await prisma.venue.findMany({
      where: {
        type: {
          in: preferredVenueTypes, // Assuming 'type' is a field in your venues table
        },
      },
      include: {
        address: true, // Include address or any other related data if needed
      },
    });

    // 5. Calculate distance using the Haversine formula (as shown in the previous answer)
    const haversine = (lat1, lon1, lat2, lon2) => {
      const toRad = (angle) => (Math.PI / 180) * angle;
      const R = 6371; // Radius of the Earth in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    // 6. Map venues with calculated distances
    const venuesWithDistance = venues.map((venue) => ({
      ...venue,
      distance: haversine(latitude, longitude, venue.latitude, venue.longitude),
    }));

    // 7. Sort venues by distance
    venuesWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venues suggested based on weather",
      data: venuesWithDistance,
    });
  } catch (error) {
    console.error("Error suggesting venues based on weather: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

export {
  getAllVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueById,
  createBooking,
  deleteBooking,
  updateBooking,
  acceptBookingRequest,
  getBookingById,
  showAllBookingRequests,
  suggestNearestVenues,
  suggestVenuesBasedOnWeather,
};
