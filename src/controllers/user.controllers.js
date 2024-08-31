import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import path from "path";
import getNearestVenues from "../utils/getNearestVenues.js";

const prisma = new PrismaClient();

const signup = async (req, res) => {
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
      message: "Login successful",
      data: {
        id: updatedUser.id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        profile_pic: profilePic,
      },
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
  console.log("getting information for user");

  // Extract user ID from the headers
  const userId = parseInt(req.headers["user_id"]);

  let { latitude, longitude, user_id } = req.body;
  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  try {
    const user = await prisma.users.findFirst({
      where: {
        id: parseInt(user_id),
      },
      include: {
        events: {
          include: {
            venue_booking: {
              include: {
                venue: true,
              },
            },
          },
        },
      },
    });

    const venues = await getNearestVenues(latitude, longitude);

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      profile_pic: user.profile_pic,
    };

    // console.log(user.events[0].venue_booking[0].venue);
    const events = user.events.map((event) => ({
      ...event,
      date: new Date(event.date).toISOString().split("T")[0],
      picture: `/events/${path.basename(event.picture)}`,
      venue_booking:
        event.venue_booking.length > 0
          ? // event.venue_booking[0].venue.length > 0
            event.venue_booking[0].venue
          : null,
    }));
    console.log(events[0]);

    // Return the results
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      data: {
        user: userInfo,
        events,
        venues,
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

export { signup, login, updateProfile, getUserInformation };
