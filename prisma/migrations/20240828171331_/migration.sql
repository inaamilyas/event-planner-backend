/*
  Warnings:

  - Made the column `event_id` on table `venueBooking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "venueBooking" ALTER COLUMN "event_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "venueBooking" ADD CONSTRAINT "venueBooking_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venueBooking" ADD CONSTRAINT "venueBooking_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
