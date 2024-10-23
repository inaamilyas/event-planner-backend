import { parse } from "date-fns";
import path from "path";
import getAddressbyCoordinates from "../utils/getAddressByCoordinates.js";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getAllVenues = async (req, res) => {
  console.log("inside get all venues");
  const { manager_id } = req.headers;

  try {
    const venues = await prisma.venues.findMany({
      where: {
        owner: {
          id: parseInt(manager_id),
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile_pic: true,
          },
        },
        venue_food_menu: true,
      },
    });

    // Update the picture paths to URLs
    // const updatedVenues = venues.map((venue) => {
    //   return {
    //     ...venue,
    //     picture: `/venues/${path.basename(venue.picture)}`,
    //     venue_food_menu: venue.venue_food_menu.map((item) => {
    //       return {
    //         ...item,
    //         picture: `/foodItems/${path.basename(item.picture)}`,
    //       };
    //     }),
    //   };
    // });

    const updatedVenues = Array.isArray(venues)
      ? venues.map((venue) => {
          // Check if 'picture' exists and is a string
          const venuePicture =
            venue.picture && typeof venue.picture === "string"
              ? `/venues/${path.basename(venue.picture)}`
              : null;

          const updatedMenu = Array.isArray(venue.venue_food_menu)
            ? venue.venue_food_menu.map((item) => {
                const itemPicture =
                  item.picture && typeof item.picture === "string"
                    ? `/foodItems/${path.basename(item.picture)}`
                    : null;

                return {
                  ...item,
                  picture: itemPicture,
                };
              })
            : []; // Handle missing or invalid 'venue_food_menu'

          return {
            ...venue,
            picture: venuePicture,
            venue_food_menu: updatedMenu,
          };
        })
      : [];

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
  const { name, about, latitude, longitude, phone, manager_id } = req.body;

  const owner = await prisma.venue_managers.findFirst({
    where: {
      id: parseInt(manager_id),
    },
  });

  try {
    // Get the image file path from req.file
    const imagePath = req.file ? req.file.path : null;

    const address = await getAddressbyCoordinates(latitude, longitude);

    const venue = await prisma.venues.create({
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
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profile_pic: true,
          },
        },
        venue_food_menu: true,
      },
    });

    // Check if 'picture' exists and is a string
    const venuePicture =
      venue.picture && typeof venue.picture === "string"
        ? `/venues/${path.basename(venue.picture)}`
        : null;

    const updatedMenu = Array.isArray(venue.venue_food_menu)
      ? venue.venue_food_menu.map((item) => {
          const itemPicture =
            item.picture && typeof item.picture === "string"
              ? `/foodItems/${path.basename(item.picture)}`
              : null;

          return {
            ...item,
            picture: itemPicture,
          };
        })
      : [];

    const updatedVenue = {
      ...venue,
      picture: venuePicture,
      venue_food_menu: updatedMenu,
    };

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue created successfully",
      data: updatedVenue,
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
  console.log("get venue by id", id);

  try {
    const venue = await prisma.venues.findFirst({
      where: {
        id: parseInt(id),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
            profile_pic: true,
          },
        },
        venue_food_menu: true,
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue details fetched successfully",
      data: {
        ...venue,
        picture: `/venues/${path.basename(venue.picture)}`,
        venue_food_menu: venue.venue_food_menu.map((menuItem) => ({
          ...menuItem,
          picture: `/foodItems/${path.basename(menuItem.picture)}`,
        })),
      },
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

const updateVenue = async (req, res) => {
  const { id } = req.params;
  console.log("inside update venue");
  const { name, about, latitude, longitude, phone } = req.body;

  try {
    // Get the image file path from req.file
    const imagePath = req.file ? req.file.path : null;

    const address = await getAddressbyCoordinates(latitude, longitude);
    const data = {
      name,
      address,
      about,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      phone: phone.toString(),
    };

    if (imagePath) {
      data.picture = imagePath;
    }

    const updatedVenue = await prisma.venues.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue created successfully",
      data: {
        ...updatedVenue,
        picture: `/venues/${path.basename(updatedVenue.picture)}`,
      },
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

const deleteVenue = async (req, res) => {
  console.log("inside delete venues");

  const { id } = req.params;

  try {
    await prisma.venues.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting venue: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const createBooking = async (req, res) => {
  console.log("create venue booking");

  const { venue_id } = req.params;
  const { date, start_time, end_time, event_id, phone } = req.body;

  console.log(req.body);

  // 1. Check for empty fields
  if (date === "" || start_time === "" || end_time === "" || event_id === "") {
    console.log("inside if");

    return res.status(400).json({
      code: 401,
      status: "error",
      message: "All fields are required",
    });
  }

  try {
    const newBooking = await prisma.venue_booking.create({
      data: {
        venue_id: parseInt(venue_id),
        event_id: parseInt(event_id),
        date: parse(date, "d/M/yyyy", new Date()),
        start_time,
        end_time,
        phone,
      },
    });

    console.log("Booking created successfully");

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Booking created successfully",
      data: newBooking.id,
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

const getUserBookings = async (req, res) => {
  const { user_id } = req.headers;
  try {
    const bookings = await prisma.venue_booking.findMany({
      where: {
        event: {
          user_id: user_id, // Filter by events created by the current user
        },
      },
      select: {
        id: true,
        phone: true,
        date: true,
        status: true,
        start_time: true,
        end_time: true,
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
            budget: true,
            about: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            latitude: true,
            longitude: true,
            phone: true,
            address: true,
            about: true,
          },
        },
        bookingFoodMenu: {
          select: {
            id: true,
            quantity: true,
            venue_food_menu: {
              select: {
                name: true,
                price: true,
                picture: true,
              },
            },
          },
        },
      },
    });

    const transformedBookings = bookings.map((booking) => ({
      ...booking,
      bookingFoodMenu: booking.bookingFoodMenu.map((food) => ({
        id: food.id,
        quantity: food.quantity,
        name: food.venue_food_menu.name,
        price: food.venue_food_menu.price,
        image: food.venue_food_menu.picture,
      })),
    }));

    res.status(200).json({
      code: 200,
      status: "success",
      data: transformedBookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

// const updateBooking = async (req, res) => {
//   const { id } = req.params;
//   const { venueId, userId, bookingDate, startTime, endTime, status } = req.body;

//   // 1. Validate ID format
//   const bookingId = parseInt(id, 10);
//   if (isNaN(bookingId)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid booking ID",
//     });
//   }

//   // 2. Check for empty fields
//   if (
//     !venueId ||
//     !userId ||
//     !bookingDate ||
//     !startTime ||
//     !endTime ||
//     !status
//   ) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "All fields are required",
//     });
//   }

//   // 3. Validate venueId and userId
//   if (!Number.isInteger(venueId) || !Number.isInteger(userId)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid venue or user ID",
//     });
//   }

//   // 4. Validate bookingDate, startTime, and endTime formats
//   if (
//     isNaN(Date.parse(bookingDate)) ||
//     isNaN(Date.parse(startTime)) ||
//     isNaN(Date.parse(endTime))
//   ) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid date format",
//     });
//   }

//   // 5. Validate status
//   const validStatuses = ["confirmed", "pending", "cancelled"];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid status value",
//     });
//   }

//   try {
//     const updatedBooking = await prisma.booking.update({
//       where: { id: bookingId },
//       data: {
//         venueId,
//         userId,
//         bookingDate: new Date(bookingDate),
//         startTime: new Date(startTime),
//         endTime: new Date(endTime),
//         status,
//       },
//     });

//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Booking updated successfully",
//       data: updatedBooking,
//     });
//   } catch (error) {
//     if (error.code === "P2025") {
//       // Prisma error code for "Record not found"
//       return res.status(404).json({
//         code: 404,
//         status: "error",
//         message: "Booking not found",
//       });
//     }
//     console.error("Error updating booking: ", error);
//     res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

// const deleteBooking = async (req, res) => {
//   const { id } = req.params;

//   // 1. Validate ID format
//   const bookingId = parseInt(id, 10);
//   if (isNaN(bookingId)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid booking ID",
//     });
//   }

//   try {
//     await prisma.booking.delete({
//       where: { id: bookingId },
//     });

//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Booking deleted successfully",
//     });
//   } catch (error) {
//     if (error.code === "P2025") {
//       // Prisma error code for "Record not found"
//       return res.status(404).json({
//         code: 404,
//         status: "error",
//         message: "Booking not found",
//       });
//     }
//     console.error("Error deleting booking: ", error);
//     res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

// const acceptBookingRequest = async (req, res) => {
//   const { bookingId } = req.params;
//   const { userId } = req.body; // Assuming this is the ID of the venue owner making the request

//   // 1. Validate ID format
//   const bookingIdInt = parseInt(bookingId, 10);
//   if (isNaN(bookingIdInt)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid booking ID",
//     });
//   }

//   // 2. Validate user ID
//   if (!Number.isInteger(userId)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid user ID",
//     });
//   }

//   try {
//     // 3. Fetch the booking and associated venue
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingIdInt },
//       include: { venue: true },
//     });

//     if (!booking) {
//       return res.status(404).json({
//         code: 404,
//         status: "error",
//         message: "Booking not found",
//       });
//     }

//     // 4. Check if the user is the owner of the venue
//     if (booking.venue.userId !== userId) {
//       return res.status(403).json({
//         code: 403,
//         status: "error",
//         message: "You are not authorized to accept this booking",
//       });
//     }

//     // 5. Update the booking status to "confirmed"
//     const updatedBooking = await prisma.booking.update({
//       where: { id: bookingIdInt },
//       data: { status: "confirmed" },
//     });

//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Booking request accepted successfully",
//       data: updatedBooking,
//     });
//   } catch (error) {
//     console.error("Error accepting booking request: ", error);
//     res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

// const showAllBookingRequests = async (req, res) => {
//   const { userId } = req.body; // Assuming this is the ID of the venue owner making the request

//   // 1. Validate user ID
//   if (!Number.isInteger(userId)) {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Invalid user ID",
//     });
//   }

//   try {
//     // 2. Fetch all venues owned by the user
//     const venues = await prisma.venue.findMany({
//       where: { userId },
//       select: { id: true },
//     });

//     if (venues.length === 0) {
//       return res.status(404).json({
//         code: 404,
//         status: "error",
//         message: "No venues found for this user",
//       });
//     }

//     // 3. Fetch all bookings for the venues owned by the user
//     const bookings = await prisma.booking.findMany({
//       where: {
//         venueId: {
//           in: venues.map((venue) => venue.id),
//         },
//       },
//       include: {
//         venue: true,
//         user: true, // Assuming you want to include user information
//       },
//     });

//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Bookings retrieved successfully",
//       data: bookings,
//     });
//   } catch (error) {
//     console.error("Error retrieving booking requests: ", error);
//     res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

// const suggestNearestVenues = async (req, res) => {
//   let { latitude, longitude } = req.body;
//   latitude = parseFloat(latitude);
//   longitude = parseFloat(longitude);

//   try {
//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Nearest venues retrieved successfully",
//       data: venuesWithDistance,
//     });
//   } catch (error) {
//     console.error("Error suggesting nearest venues: ", error);
//     res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

// const suggestVenuesBasedOnWeather = async (req, res) => {
//   const { latitude, longitude } = req.body;

//   // 1. Validate latitude and longitude
//   if (typeof latitude !== "number" || typeof longitude !== "number") {
//     return res.status(400).json({
//       code: 400,
//       status: "error",
//       message: "Latitude and longitude must be numbers",
//     });
//   }

//   try {
//     // 2. Fetch weather data using a weather API
//     const weatherApiKey = "YOUR_WEATHER_API_KEY"; // Replace with your Weather API key
//     const weatherResponse = await axios.get(
//       `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${latitude},${longitude}`
//     );
//     const weatherData = weatherResponse.data;

//     const currentCondition = weatherData.current.condition.text.toLowerCase();

//     // 3. Determine venue type preference based on weather
//     let preferredVenueTypes;
//     if (
//       currentCondition.includes("rain") ||
//       currentCondition.includes("storm")
//     ) {
//       preferredVenueTypes = ["indoor"]; // Suggest indoor venues for rainy or stormy weather
//     } else if (
//       currentCondition.includes("sunny") ||
//       currentCondition.includes("clear")
//     ) {
//       preferredVenueTypes = ["outdoor", "indoor"]; // Suggest outdoor or indoor venues for sunny weather
//     } else {
//       preferredVenueTypes = ["indoor", "outdoor"]; // Default to suggesting both types
//     }

//     // 4. Fetch venues based on the preferred venue types
//     const venues = await prisma.venues.findMany({
//       where: {
//         type: {
//           in: preferredVenueTypes,
//         },
//       },
//       include: {
//         address: true,
//       },
//     });

//     // 5. Calculate distance using the Haversine formula
//     const haversine = (lat1, lon1, lat2, lon2) => {
//       const toRad = (angle) => (Math.PI / 180) * angle;
//       const R = 6371; // Radius of the Earth in km
//       const dLat = toRad(lat2 - lat1);
//       const dLon = toRad(lon2 - lon1);
//       const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(toRad(lat1)) *
//           Math.cos(toRad(lat2)) *
//           Math.sin(dLon / 2) *
//           Math.sin(dLon / 2);
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       return R * c; // Distance in km
//     };

//     // 6. Map venues with calculated distances
//     const venuesWithDistance = venues.map((venue) => ({
//       ...venue,
//       distance: haversine(latitude, longitude, venue.latitude, venue.longitude),
//     }));

//     // 7. Sort venues by distance
//     venuesWithDistance.sort((a, b) => a.distance - b.distance);

//     res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Venues suggested based on weather",
//       data: venuesWithDistance,
//     });
//   } catch (error) {
//     console.error("Error suggesting venues based on weather: ", error);
//     res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };

export {
  getAllVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueById,
  createBooking,
  getUserBookings,
};
