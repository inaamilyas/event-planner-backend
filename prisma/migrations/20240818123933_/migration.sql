/*
  Warnings:

  - You are about to drop the column `email` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `profile_pic` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `usersId` on the `events` table. All the data in the column will be lost.
  - Added the required column `budget` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "events" DROP CONSTRAINT "events_usersId_fkey";

-- DropIndex
DROP INDEX "events_email_key";

-- AlterTable
ALTER TABLE "events" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "profile_pic",
DROP COLUMN "usersId",
ADD COLUMN     "about" TEXT,
ADD COLUMN     "budget" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "no_of_guests" INTEGER,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "time" TIMESTAMP(3),
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
