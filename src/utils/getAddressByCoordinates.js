import axios from "axios";

const getAddressByCoordinates = async (lat, long) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}&language=en`;
  const response = await axios.get(url, {
    headers: {
      "Accept-Language": "en",
    },
  });

  return response.data.display_name;
};

export default getAddressByCoordinates;