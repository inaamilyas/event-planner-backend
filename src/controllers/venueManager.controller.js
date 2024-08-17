import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const signup = async (req, res) => {
  const { fullname, email, password, confirmPassword, phone } = req.body;

  // 1. Check for empty fields
  if (!fullname || !email || !password || !confirmPassword) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "All fields are required",
    });
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid email format",
    });
  }

  // 3. Check if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Passwords do not match",
    });
  }

  // 4. Check if user already exists
  try {
    const existingUser = await prisma.VenueManagers.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({
        code: 409,
        status: "error",
        message: "User already exists",
      });
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Save the user data
    const newUser = await prisma.VenueManagers.create({
      data: {
        name: fullname,
        email,
        phone,
        password: hashedPassword,
      },
    });

    // 7. Return success response
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Signup successful",
      data: {
        id: newUser.id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
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
    });
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid email format",
    });
  }

  try {
    // 3. Check if user exists
    const user = await prisma.VenueManagers.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User not found",
      });
    }

    // 4. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Incorrect password",
      });
    }

    // 5. Return success response
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successful",
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during login: ", error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
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
    const updatedUser = await prisma.VenueManagers.update({
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

export { signup, login, updateProfile };
