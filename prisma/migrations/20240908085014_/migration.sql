-- CreateTable
CREATE TABLE "venue_food_menu" (
    "id" SERIAL NOT NULL,
    "venue_id" INTEGER NOT NULL,
    "name" TEXT,
    "price" TEXT,
    "is_available" BOOLEAN,
    "picture" TEXT,

    CONSTRAINT "venue_food_menu_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "venue_food_menu" ADD CONSTRAINT "venue_food_menu_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
