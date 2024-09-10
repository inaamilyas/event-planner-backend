/*
  Warnings:

  - You are about to drop the `_BookingMenu` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[booking_id,food_menu_id]` on the table `booking_food_menu` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_BookingMenu" DROP CONSTRAINT "_BookingMenu_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingMenu" DROP CONSTRAINT "_BookingMenu_B_fkey";

-- DropTable
DROP TABLE "_BookingMenu";

-- CreateIndex
CREATE UNIQUE INDEX "booking_food_menu_booking_id_food_menu_id_key" ON "booking_food_menu"("booking_id", "food_menu_id");
