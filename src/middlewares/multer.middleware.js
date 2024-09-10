// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/venues");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a unique name
//   }
// });

// export const upload = multer({
//   storage,
// });

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check the URL or a custom field to determine the destination folder
    if (req.originalUrl.includes("events")) {
      cb(null, "./public/events");
    } else if (req.originalUrl.includes("venues")) {
      cb(null, "./public/venues");
    } else if (req.originalUrl.includes("food-menu")) {
      cb(null, "./public/foodItems");
    } else {
      cb(null, "./public/others"); // Handle the case where the path is not recognized
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file with a unique name
  },
});

export const upload = multer({
  storage,
});
