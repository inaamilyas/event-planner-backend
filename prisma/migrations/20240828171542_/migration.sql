/*
  Warnings:

  - You are about to drop the `venueBooking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "venueBooking" DROP CONSTRAINT "venueBooking_event_id_fkey";

-- DropForeignKey
ALTER TABLE "venueBooking" DROP CONSTRAINT "venueBooking_venue_id_fkey";

-- DropTable
DROP TABLE "venueBooking";

-- CreateTable
CREATE TABLE "venue_booking" (
    "id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "phone" TEXT,
    "date" TIMESTAMP(3),
    "start_time" TEXT,
    "end_time" TEXT,

    CONSTRAINT "venue_booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "venue_booking" ADD CONSTRAINT "venue_booking_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_booking" ADD CONSTRAINT "venue_booking_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
