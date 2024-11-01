import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const saveFeedback = async (req, res) => {
  console.log("inside save feedback");
  console.log(req.body);
  
  const { user_id, venue_id, feedback } = req.body;

  // 1. Check for empty fields
  if (!user_id || !venue_id || !feedback) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "All fields are required",
      data: null,
    });
  }

  try {
    const savedfeedback = await prisma.venue_feedbacks.create({
      data: {
        user_id: parseInt(user_id),
        venue_id: parseInt(venue_id),
        feedback: feedback,
      },
    });

    console.log("saving...");
    
    // 7. Return success response
    return res.status(200).json({
      code: 200,
      status: "success",
      message: "Feedback saved successfully",
      data: null,
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

export { saveFeedback };
