import { parse } from "date-fns";
import path from "path";
import getAddressbyCoordinates from "../utils/getAddressByCoordinates.js";

import { PrismaClient } from "@prisma/client";
import sendFCMNotification from "../utils/fcmNotifications.js";
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
        venue_feedbacks: {
          include: {
            user: true,
          },
        },
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

          const galleryPictures = venue.gallery
            ? venue?.gallery?.map(
                (picture) => `/venues/${path.basename(picture)}`
              )
            : [];

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

          const venue_feedbacks = venue?.venue_feedbacks.map((feebackItem) => {
            const user = feebackItem.user;
            return {
              feedback: feebackItem.feedback,
              username: user?.name || null,
              profile_picture: user?.picture
                ? `/users/${path.basename(user.picture)}`
                : null,
            };
          });

          return {
            ...venue,
            picture: venuePicture,
            gallery: galleryPictures,
            venue_food_menu: updatedMenu,
            venue_feedbacks: venue_feedbacks,
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
    // const imagePath = req.file ? req.file.path : null;

    const imagePath = req.files["picture"]
      ? req.files["picture"][0].path
      : null;
    const gallery = req.files["gallery"] || [];

    const galleryPaths = gallery.map((file) => path.normalize(file.path));

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
        gallery: galleryPaths ? galleryPaths : [],
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
        venue_feedbacks: {
          include: {
            user: true,
          },
        },
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
        venue_feedbacks: venue?.venue_feedbacks
          .map((feebackItem) => {
            const user = feebackItem.user;

            return {
              feedback: feebackItem.feedback,
              username: user?.name || null,
              profile_picture: user?.picture
                ? `/users/${path.basename(user.picture)}`
                : null,
            };
          })
          .slice(0, 10),
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
    const deltedVenue = await prisma.venues.delete({
      where: { id: parseInt(id) },
      include: {
        owner: true,
      },
    });

    sendFCMNotification([deltedVenue?.owner?.fcm_token], {
      title: `${deltedVenue.name.toUpperCase()} DELETED`,
      body: `Your venue ${deltedVenue.name} has been deleted`,
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
      include: {
        event: true,
        venue: true,
      },
    });

    // send notification to manager for booking
    const venue = await prisma.venues.findFirst({
      where: {
        id: parseInt(venue_id),
      },
      include: {
        owner: {
          select: {
            fcm_token: true,
          },
        },
      },
    });

    const fcmToken = venue?.owner?.fcm_token;

    sendFCMNotification([fcmToken], {
      title: `New Booking for ${venue.name}`,
      body: `Event : ${newBooking?.event?.name} - (${
        newBooking.date +
        " " +
        newBooking.start_time +
        "-" +
        newBooking.end_time
      })`,
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
  console.log("inside get bookings");
  const { user_id } = req.headers;

  try {
    const bookings = await prisma.venue_booking.findMany({
      where: {
        event: {
          user_id: parseInt(user_id), // Filter by events created by the current user
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

const getMangerVenuesBookings = async (req, res) => {
  console.log("inside manager venues bookings");
  const { manager_id } = req.headers;

  try {
    const bookings = await prisma.venue_booking.findMany({
      where: {
        venue: {
          owner_id: parseInt(manager_id), // Filter by events created by the current user
        },
      },
      orderBy: {
        created_at: "desc", // Sort by date in descending order
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

const changeOrderStatus = async (req, res) => {
  console.log("inside change order status");
  const { booking_id, status } = req.body;

  try {
    const booking = await prisma.venue_booking.update({
      where: {
        id: parseInt(booking_id),
      },
      data: {
        status: parseInt(status),
      },
      select: {
        event: {
          include: {
            user: true,
          },
        },
      },
    });

    // send Notification to user for booking status
    sendFCMNotification(
      [booking?.event?.user?.fcm_token],
      {
        // title: "test notification",
        body: `Venue Booking request for ${booking?.event?.name} ${
          status === 1 ? "accepted successfully" : "cancled"
        } `,
      },
      {
        title: `Order ${status === 1 ? "accepted successfully" : "cancled"}`,
      }
    );

    res.status(200).json({
      code: 200,
      status: "success",
      message: `Order ${status === 1 ? "accepted" : "cancled"} successfully`,
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

const deleteUserBooking = async (req, res) => {
  console.log("inside user delete booking");
  const { booking_id } = req.body;

  try {
    await prisma.venue_booking.delete({
      where: {
        id: parseInt(booking_id),
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: `Order deleted successfully`,
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

export {
  getAllVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  getVenueById,
  createBooking,
  getUserBookings,
  getMangerVenuesBookings,
  changeOrderStatus,
  deleteUserBooking,
};
