import { PrismaClient } from "@prisma/client";

import { parse } from "date-fns";
const prisma = new PrismaClient();


// Convert date format to ISO 8601
const formattedDate = parse('21/8/2024', 'd/M/yyyy', new Date());

const createEvent = async (req, res) => {
  const userId = 4;
  const picture = req.file ? req.file.path : null;
  const { name, time, date, no_of_guests, about, budget } = req.body;


//   const formattedDate = new Date(date);
  

  // 1. Check for empty fields
  if (!name || !time || !date || !no_of_guests || !about || !budget) {
    
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "data is missing",
      data: null,
    });
  }

  try {
    const newEvent = await prisma.events.create({
      data: {
        name,
        date: parse(date, 'd/M/yyyy', new Date()),
        time,
        no_of_guests:parseInt(no_of_guests),
        about,
        budget: budget ? parseFloat(budget) : null,
        user_id: userId,
        picture,
      },
    });
    
    res.status(200).json({
      code: 200,
      status: "success",
      message: "Event created successfully",
      data: newEvent.id,
    });
  } catch (error) {
    console.error("Error creating event: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const eventId = parseInt(id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid event ID",
    });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Event not found",
      });
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Event retrieved successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error retrieving event: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location } = req.body;

  // 1. Validate ID format
  const eventId = parseInt(id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid event ID",
    });
  }

  // 2. Check for empty fields
  if (!title || !date || !location) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Title, date, and location are required",
    });
  }

  // 3. Validate title and location format
  if (typeof title !== "string" || typeof location !== "string") {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Title and location must be strings",
    });
  }

  // 4. Validate date format
  if (isNaN(Date.parse(date))) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid date format",
    });
  }

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        date: new Date(date),
        location,
      },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for "Record not found"
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Event not found",
      });
    }
    console.error("Error updating event: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID format
  const eventId = parseInt(id, 10);
  if (isNaN(eventId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid event ID",
    });
  }

  try {
    await prisma.event.delete({
      where: { id: eventId },
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Event deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma error code for "Record not found"
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Event not found",
      });
    }
    console.error("Error deleting event: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

const listUserEvents = async (req, res) => {
  const { userId } = req.body; // Assuming userId is passed in the request body or you can use req.userId if the user is authenticated

  // 1. Validate user ID
  if (!Number.isInteger(userId)) {
    return res.status(400).json({
      code: 400,
      status: "error",
      message: "Invalid user ID",
    });
  }

  try {
    // 2. Fetch all events created by the user
    const events = await prisma.event.findMany({
      where: { userId },
      include: {
        venue: true, // Include related venue information if needed
        guests: true, // Include related guests information if needed
      },
    });

    if (events.length === 0) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "No events found for this user",
      });
    }

    res.status(200).json({
      code: 200,
      status: "success",
      message: "Events retrieved successfully",
      data: events,
    });
  } catch (error) {
    console.error("Error retrieving events: ", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
};

export { createEvent, updateEvent, getEventById, deleteEvent, listUserEvents };
