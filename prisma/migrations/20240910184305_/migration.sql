/*
  Warnings:

  - Added the required column `food_menu` to the `venue_booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "venue_booking" ADD COLUMN     "food_menu" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "booking_food_menu" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "food_menu_id" INTEGER NOT NULL,

    CONSTRAINT "booking_food_menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookingMenu" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookingMenu_AB_unique" ON "_BookingMenu"("A", "B");

-- CreateIndex
CREATE INDEX "_BookingMenu_B_index" ON "_BookingMenu"("B");

-- AddForeignKey
ALTER TABLE "booking_food_menu" ADD CONSTRAINT "booking_food_menu_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "venue_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_food_menu" ADD CONSTRAINT "booking_food_menu_food_menu_id_fkey" FOREIGN KEY ("food_menu_id") REFERENCES "venue_food_menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingMenu" ADD CONSTRAINT "_BookingMenu_A_fkey" FOREIGN KEY ("A") REFERENCES "venue_booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingMenu" ADD CONSTRAINT "_BookingMenu_B_fkey" FOREIGN KEY ("B") REFERENCES "venue_food_menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
