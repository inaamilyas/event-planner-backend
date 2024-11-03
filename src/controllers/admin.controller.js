import { PrismaClient } from "@prisma/client";
import path from "path";
import sendFCMNotification from "../utils/fcmNotifications.js";

const prisma = new PrismaClient();

const getVenuesForApprove = async (req, res) => {
  console.log("inside get venus for admin dashboard");

  try {
    const venues = await prisma.venues.findMany({
      where: {
        // status: 0,
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

      console.log(updatedVenues);
      

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue fetched successfully",
      data: updatedVenues,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Something went wrong",
      error,
    });
  }
};

const changeVenueStaus = async (req, res) => {
  const { status, venue_id } = req.body;
  console.log("inside change venue status", status, venue_id);

  try {
    const venue = await prisma.venues.update({
      where: {
        id: parseInt(venue_id),
      },
      data: {
        status: status,
      },
      include: {
        owner: true,
      },
    });

    sendFCMNotification([venue?.owner?.fcm_token], {
      title: `${venue.name.toUpperCase()} Approval Status`,
      body: `Your request for ${venue.name} has been ${
        status === 1 ? "approved" : "rejected"
      }`,
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Venues status updated successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Something went wrong",
      data: null,
    });
  }
};

export { getVenuesForApprove, changeVenueStaus };
