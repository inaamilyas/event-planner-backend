import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const addGuestToEvent = async (req, res) => {
    const { eventId, guestName, guestEmail } = req.body;

    // 1. Check for empty fields
    if (!eventId || !guestName || !guestEmail) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Event ID, guest name, and guest email are required",
        });
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Invalid email format",
        });
    }

    try {
        // 3. Add guest to event
        const newGuest = await prisma.guest.create({
            data: {
                eventId,
                name: guestName,
                email: guestEmail,
            },
        });

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Guest added successfully",
            data: newGuest,
        });
    } catch (error) {
        console.error("Error adding guest: ", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
        });
    }
};


const getGuestsForEvent = async (req, res) => {
    const { eventId } = req.params;

    // 1. Validate event ID format
    const eventIdInt = parseInt(eventId, 10);
    if (isNaN(eventIdInt)) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Invalid event ID",
        });
    }

    try {
        // 2. Fetch all guests for the event
        const guests = await prisma.guest.findMany({
            where: { eventId: eventIdInt },
        });

        if (guests.length === 0) {
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "No guests found for this event",
            });
        }

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Guests retrieved successfully",
            data: guests,
        });
    } catch (error) {
        console.error("Error retrieving guests: ", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
        });
    }
};

const updateGuest = async (req, res) => {
    const { guestId } = req.params;
    const { guestName, guestEmail } = req.body;

    // 1. Validate guest ID format
    const guestIdInt = parseInt(guestId, 10);
    if (isNaN(guestIdInt)) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Invalid guest ID",
        });
    }

    // 2. Check for empty fields
    if (!guestName || !guestEmail) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Guest name and email are required",
        });
    }

    // 3. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Invalid email format",
        });
    }

    try {
        // 4. Update guest information
        const updatedGuest = await prisma.guest.update({
            where: { id: guestIdInt },
            data: {
                name: guestName,
                email: guestEmail,
            },
        });

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Guest updated successfully",
            data: updatedGuest,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            // Prisma error code for "Record not found"
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Guest not found",
            });
        }
        console.error("Error updating guest: ", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
        });
    }
};


const removeGuest = async (req, res) => {
    const { guestId } = req.params;

    // 1. Validate guest ID format
    const guestIdInt = parseInt(guestId, 10);
    if (isNaN(guestIdInt)) {
        return res.status(400).json({
            code: 400,
            status: "error",
            message: "Invalid guest ID",
        });
    }

    try {
        // 2. Remove guest from event
        await prisma.guest.delete({
            where: { id: guestIdInt },
        });

        res.status(200).json({
            code: 200,
            status: "success",
            message: "Guest removed successfully",
        });
    } catch (error) {
        if (error.code === 'P2025') {
            // Prisma error code for "Record not found"
            return res.status(404).json({
                code: 404,
                status: "error",
                message: "Guest not found",
            });
        }
        console.error("Error removing guest: ", error);
        res.status(500).json({
            code: 500,
            status: "error",
            message: "Internal server error",
        });
    }
};

