-- CreateTable
CREATE TABLE "venueBooking" (
    "id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "event_id" INTEGER,
    "phone" TEXT,
    "date" TIMESTAMP(3),
    "start_time" TEXT,
    "end_time" TEXT,

    CONSTRAINT "venueBooking_pkey" PRIMARY KEY ("id")
);
