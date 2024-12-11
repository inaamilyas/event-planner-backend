import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import path from 'path'

const prisma = new PrismaClient();

const signup = async (req, res) => {
  console.log("inside manager sign up");
  const { name, email, phone, password, confirmPassword, fcm_token } = req.body;

  // 1. Check for empty fields
  if (!name || !email || !phone || !password || !confirmPassword) {
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
    const existingUser = await prisma.venue_managers.findUnique({
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
    const newUser = await prisma.venue_managers.create({
      data: {
        name,
        email,
        phone,
        fcm_token,
        password: hashedPassword,
        profile_pic: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
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
      data: null,
    });
  }
};

const login = async (req, res) => {
  console.log("inside manager login");
  const { email, password, fcm_token } = req.body;

  console.log(fcm_token);
  

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
    const user = await prisma.venue_managers.findUnique({
      where: { email: email },
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
    const isPasswordValid = bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 401,
        status: "error",
        message: "Incorrect password",
        data: null,
      });
    }

    const updatedUser = await prisma.venue_managers.update({
      where: {
        id: user.id,
      },
      data: {
        fcm_token: fcm_token,
      },
    });

    // 5. Return success response
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Login successfully",
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

// const updateProfile = async (req, res) => {
//   try {
//     const { fullname, email, password } = req.body;
//     const profilePic = req.file ? req.file.filename : null;

//     // Hash the password if it's provided
//     let hashedPassword = undefined;
//     if (password) {
//       hashedPassword = await bcrypt.hash(password, 10);
//     }

//     // Update user profile in database
//     const updatedUser = await prisma.venue_managers.update({
//       where: { email: email },
//       data: {
//         fullname: fullname,
//         email: email,
//         ...(hashedPassword && { password: hashedPassword }), // Update password if provided
//         profilePic: profilePic,
//       },
//     });

//     console.log(updatedUser);

//     return res.status(200).json({
//       code: 200,
//       status: "success",
//       message: "Profile updated successfully",
//       data: {
//         id: updatedUser.id,
//         fullname: updatedUser.fullname,
//         email: updatedUser.email,
//         profile_pic: profilePic,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       code: 500,
//       status: "error",
//       message: "Internal server error",
//     });
//   }
// };


const updateProfile = async (req, res) => {
  console.log("inside update profile");
  try {
    console.log(req.body);
    
    const { name, email, password } = req.body;
    const profilePic = req.file ? req.file.filename : null;
    const { manager_id } = req.headers;
    

    // Hash the password if it's provided
    let hashedPassword = undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user profile in database
    const updatedUser = await prisma.venue_managers.update({
      where: { id: parseInt(manager_id) },
      data: {
        name: name,
        email: email,
        ...(hashedPassword && { password: hashedPassword }), // Update password if provided
        profile_pic: profilePic,
      },
      select: {
        name: true,
        email: true,
        id: true,
        profile_pic: true,
      },
    });

    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Profile updated successfully",
      data: {
        ...updatedUser,
        profile_pic: updatedUser?.profile_pic
          ? `/users/${path.basename(updatedUser.profile_pic)}`
          : null,
      },
    });
  } catch (error) {
    // Handle specific Prisma unique constraint error
    if (error.code === "P2002") {
      return res.status(409).json({
        code: 409,
        status: "error",
        message: `Email '${req.body.email}' is already taken.`,
        data: null,
      });
    }

    console.error(error);
    return res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

export { signup, login, updateProfile };
