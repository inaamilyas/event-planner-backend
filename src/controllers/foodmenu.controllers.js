import path from "path";

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
  console.log("calling add food item for venue");

  const { venue_id } = req.params;
  const { name, price } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    const foodItems = await prisma.venue_food_menu.create({
      data: {
        name,
        price,
        picture: imagePath,
        venue_id: parseInt(venue_id),
      },
    });

    console.log(foodItems);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Food Item added successfully",
      data: {
        ...foodItems,
        picture: `/foodItems/${path.basename(foodItems.picture)}`,
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

const updateFoodItemForVenue = async (req, res) => {
  console.log("inside update menu item");

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

    const imagePath = req.file ? req.file.path : null;
    if (imagePath) {
      data.picture = imagePath;
    }

    const foodItems = await prisma.venue_food_menu.update({
      where: {
        id: parseInt(id),
      },
      data,
    });

    console.log(foodItems);

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Food Item updated successfully",
      data: {
        ...foodItems,
        picture: `/foodItems/${path.basename(foodItems.picture)}`,
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

const deleteFoodItemForVenue = async (req, res) => {
  console.log("inside food menu delete");

  const { id } = req.params;
  console.log(id);

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
  console.log("inside save  food items");
  // try {
  // Extract booking_id and menu_item_ids from request body
  const { booking_id, menu_item_ids } = req.body;

  // Check if the booking exists
  const bookingExists = await prisma.venue_booking.findFirst({
    where: { id: parseInt(booking_id) },
  });

  if (!bookingExists) {
    return res.status(404).json({
      code: 404,
      status: "error",
      message: "Booking not found.",
    });
  }

  const bookedMenuItems = await Promise.all(
    Object.entries(menu_item_ids).map(async ([menuItemId, quantity]) => {
      const existingItem = await prisma.booking_food_menu.findUnique({
        where: {
          booking_id_food_menu_id: {
            booking_id: booking_id,
            food_menu_id: parseInt(menuItemId),
          },
        },
      });

      if (!existingItem) {
        return prisma.booking_food_menu.create({
          data: {
            booking_id: booking_id,
            food_menu_id: parseInt(menuItemId),
            quantity: quantity,
          },
        });
      } else {
        // Optionally, update the existing item if you need to modify the quantity
        return prisma.booking_food_menu.update({
          where: {
            booking_id_food_menu_id: {
              booking_id: booking_id,
              food_menu_id: parseInt(menuItemId),
            },
          },
          data: {
            quantity: existingItem.quantity + quantity, // Update the quantity
          },
        });
      }
    })
  );

  console.log(bookedMenuItems);

  // Respond with success
  res.status(201).json({
    code: 201,
    status: "success",
    message: "Menu items successfully booked.",
    // data: bookedMenuItems,
  });
  // } catch (error) {
  //   console.error("Error booking menu items:", error);
  //   res.status(500).json({
  //     code: 500,
  //     status: "error",
  //     message: "An error occurred while booking menu items.",
  //   });
  // }
};

export {
  getFoodItemsByVenue,
  addFoodItemForVenue,
  updateFoodItemForVenue,
  deleteFoodItemForVenue,
  saveFoodItemsForBooking,
};
