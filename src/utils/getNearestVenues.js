import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import path from "path";

const getNearestVenues = async (latitude, longitude) => {
  // 2. Fetch all venues with their coordinates
  const venues = await prisma.venues.findMany({
    where:{
      status:1
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          profile_pic: true,
        },
      },
      venue_food_menu: true,
    },
  });

  // 3. Calculate distance using the Haversine formula
  const haversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (angle) => (Math.PI / 180) * angle;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Helper function to format distance
  const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}m`;
    } else if (distanceInKm < 10) {
      return `${distanceInKm.toFixed(1)}KM`;
    } else {
      return `${Math.round(distanceInKm)}KM`;
    }
  };

// Map venues with calculated distances and format the picture paths
const venuesWithDistance = venues?.map((venue) => ({
  ...venue,
  // Calculate the distance using the haversine formula, ensuring coordinates are present
  distance: venue?.latitude && venue?.longitude
    ? haversine(latitude, longitude, venue.latitude, venue.longitude)
    : null,
  // Format venue picture path if it exists
  picture: venue?.picture ? `/venues/${path.basename(venue.picture)}` : null,
  // Safely map menu items and format their picture paths if venue_food_menu exists
  venue_food_menu: venue?.venue_food_menu?.map((menuItem) => ({
    ...menuItem,
    picture: menuItem?.picture ? `/foodItems/${path.basename(menuItem.picture)}` : null,
  })) ?? [], // Default to an empty array if venue_food_menu is undefined or null
})) ?? []; // Default to an empty array if venues is undefined or null

// Sort venues by distance (ascending order), skipping venues with no distance
venuesWithDistance.sort((a, b) => {
  if (a.distance === null) return 1;
  if (b.distance === null) return -1;
  return a.distance - b.distance;
});

// Format the distance after sorting, ensuring distance is present
const formattedVenues = venuesWithDistance.map((venue) => ({
  ...venue,
  distance: venue?.distance !== null ? formatDistance(venue.distance) : "Distance Unavailable",
}));

  return formattedVenues;
};

export default getNearestVenues;
