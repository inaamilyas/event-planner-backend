import path, { parse } from "path";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const getFoodItemsByVenue = async (req, res) => {
  const { venue_id } = req.params;
  try {
    const foodItems = await prisma.venue_food_menu.findMany({
      where: {
        venue_id: parseInt(venue_id),
      },
    });

    // Update the picture paths to URLs
    const updatedItems = foodItems.map((item) => {
      return {
        ...item,
        picture: `/foodItems/${path.basename(item.picture)}`,
      };
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Venue fetched successfully",
      data: updatedItems,
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

const addFoodItemForVenue = async (req, res) => {
  const { venue_id } = req.params;
  const { name, price } = req.body;
  const imagePath = req.file ? req.file.path : null;
  
  try {
    const foodItems = await prisma.venue_food_menu.create({
      data: {
        name,
        price,
        picture:imagePath,
        venue_id: parseInt(venue_id),
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Food Item added successfully",
      data: foodItems,
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

const updateFoodItemForVenue = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const data = {};

    if (name) {
      data.name = name;
    }

    if (price) {
      data.price = price;
    }

    if (req.file) {
      data.picture = req.file;
    }

    const foodItems = await prisma.venue_food_menu.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Food Item added successfully",
      data: foodItems,
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

const deleteFoodItemForVenue = async (req, res) => {
  const { id } = req.params;
  try {
    const foodItems = await prisma.venue_food_menu.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Food Item deleted successfully",
      data: foodItems,
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

const saveFoodItemsForBooking = async (req, res) => {
    try {
      // Extract booking_id and menu_item_ids from request body
      const { booking_id, menu_item_ids } = req.body;
  
      // Validate input
      if (!booking_id || !Array.isArray(menu_item_ids) || menu_item_ids.length === 0) {
        return res.status(400).json({
          code: 400,
          status: 'error',
          message: 'Booking ID and an array of menu item IDs are required.',
        });
      }
  
      // Check if the booking exists
      const bookingExists = await prisma.venue_booking.findUnique({
        where: { id: booking_id },
      });
  
      if (!bookingExists) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Booking not found.',
        });
      }
  
      // Create records in the booking_food_menu junction table
      const bookedMenuItems = await Promise.all(
        menu_item_ids.map((menuItemId) =>
          prisma.booking_food_menu.create({
            data: {
              booking_id: booking_id,
              food_menu_id: menuItemId,
            },
          })
        )
      );
  
      // Respond with success
      res.status(201).json({
        code: 201,
        status: 'success',
        message: 'Menu items successfully booked.',
        data: bookedMenuItems,
      });
    } catch (error) {
      console.error('Error booking menu items:', error);
      res.status(500).json({
        code: 500,
        status: 'error',
        message: 'An error occurred while booking menu items.',
      });
    }
  };



export {
  getFoodItemsByVenue,
  addFoodItemForVenue,
  updateFoodItemForVenue,
  deleteFoodItemForVenue,
  saveFoodItemsForBooking
};
