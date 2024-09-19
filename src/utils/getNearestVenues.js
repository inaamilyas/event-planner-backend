import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import path from "path";

const getNearestVenues = async (latitude, longitude) => {
  // 2. Fetch all venues with their coordinates
  const venues = await prisma.venues.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          phone: true,
          profile_pic: true,
        },
      },
      venue_food_menu:true
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

  // Map venues with calculated distances
  const venuesWithDistance = venues.map((venue) => ({
    ...venue,
    distance: formatDistance(
      haversine(latitude, longitude, venue.latitude, venue.longitude)
    ),
    picture: `/venues/${path.basename(venue.picture)}`,
    venue_food_menu: venue.venue_food_menu.map((menuItem) => ({
      ...menuItem,
      picture: `/foodItems/${path.basename(menuItem.picture)}`,
    })),
  }));
  

  // Sort venues by distance
  venuesWithDistance.sort(
    (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
  );

  return venuesWithDistance;
};

export default getNearestVenues;
