import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import path from "path";
import getNearestVenues from "../utils/getNearestVenues.js";
import getRandomVenues from "../utils/getAllVenues.js";

const prisma = new PrismaClient();

const signup = async (req, res) => {
  console.log("inside sign up");
  const { name, email, password, confirmPassword } = req.body;
  // 1. Check for empty fields
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "All fields are required",
      data: null,
    });
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid email format",
      data: null,
    });
  }

  // 3. Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Passwords do not match",
      data: null,
    });
  }

  // 4. Check if user already exists
  try {
    const existingUser = await prisma.users.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({
        code: 409,
        status: "error",
        message: "User already exists",
        data: null,
      });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Save the user data
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile_pic: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profile_pic: true,
      },
    });

    // 7. Return success response
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Signup successful",
      data: newUser,
    });
  } catch (error) {
    console.error("Error creating user: ", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  console.log("inside login");
  const { email, password } = req.body;

  // 1. Check for empty fields
  if (!email || !password) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Email and password are required",
      data: null,
    });
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid email format",
      data: null,
    });
  }

  try {
    // 3. Check if user exists
    const user = await prisma.users.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        profile_pic: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Email not found",
        data: null,
      });
    }

    // 4. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Incorrect password",
        data: null,
      });
    }

    // 5. Return success response
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("Error during login: ", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
      data: null,
    });
  }
};

const updateProfile = async (req, res) => {
  console.log("inside update profile");
  try {
    const { fullname, email, password } = req.body;
    const profilePic = req.file ? req.file.filename : null;

    // Hash the password if it's provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        fullname: fullname,
        email: email,
        ...(hashedPassword && { password: hashedPassword }), // Update password if provided
        profilePic: profilePic,
      },
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Profile updated successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const getUserInformation = async (req, res) => {
  console.log("inside get user information");
  // Extract user ID from the headers
  const user_id = parseInt(req.headers["user_id"]);

  let { latitude, longitude } = req.body;
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  try {
    const currentDate = new Date();
    const user = await prisma.users.findFirst({
      where: {
        id: parseInt(user_id),
      },
      include: {
        events: {
          where:{
            date: { lt: currentDate },
          },
          include: {
            venue_booking: {
              take: 1,
              orderBy: {
                created_at: "desc",
              },
              include: {
                venue: true,
                bookingFoodMenu: {
                  include: {
                    venue_food_menu: true,
                  },
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    const  upcomingEvents = await getUpcomingEvents(user_id);
    let events = formatEvents(upcomingEvents);
    const allEvents = formatEvents(user?.events);
    events = [...events, ...allEvents];

    const venues = await getNearestVenues(latitude, longitude);
    const allVenues = await getRandomVenues(latitude, longitude);

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
    };

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      data: {
        user: userInfo,
        events,
        venues,
        all_venues: allVenues,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

// Function to fetch upcoming events
const getUpcomingEvents = async (user_id) => {
  const currentDate = new Date(); // Get the current date
  return await prisma.events.findMany({
    where: {
      user_id: user_id,
      date: { gte: currentDate }, // Filter for upcoming events
    },
    include: {
      venue_booking: {
        take: 1,
        orderBy: { created_at: "desc" },
        include: {
          venue: true,
          bookingFoodMenu: { include: { venue_food_menu: true } },
        },
      },
    },
    orderBy: { date: "asc" }, // Sort upcoming events by date in ascending order
  });
};

// Function to format events
const formatEvents = (events) => {
  return events?.map((event) => {
    const eventDate = event?.date ? new Date(event.date) : null;
    const formattedDate = eventDate
      ? `${eventDate.getDate().toString().padStart(2, "0")}/${(
          eventDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${eventDate.getFullYear()}`
      : "Invalid Date";

    return {
      ...event,
      date: formattedDate,
      picture: event?.picture
        ? `/events/${path.basename(event.picture)}`
        : null,
      venue_booking:
        event?.venue_booking?.length > 0
          ? {
              ...event.venue_booking[0]?.venue,
              venue_food_menu: event.venue_booking[0]?.bookingFoodMenu?.map(
                (item) => ({
                  id: item?.id ?? null,
                  quantity: item?.quantity ?? null,
                  name: item?.venue_food_menu?.name ?? "Unknown Item",
                  price: item?.venue_food_menu?.price ?? "Price Unavailable",
                  picture: item?.venue_food_menu?.picture
                    ? `/foodItems/${path.basename(
                        item.venue_food_menu.picture
                      )}`
                    : null,
                })
              ),
            }
          : null,
    };
  });
};

export { signup, login, updateProfile, getUserInformation };
