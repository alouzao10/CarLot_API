const express = require("express");
const router = express.Router();

const newCars = require("../data/NewCars.js");

router.get("/", (req, res) => {
   res.status(200).json(newCars);
});

router.get("/car/:id", (req, res) => {
   let carID = parseInt(req.params.id);
   let carFound = newCars.some((car) => car.id === carID);
   if (!carFound) {
      res.status(400).json({
         msg: "ERROR: Your car was not found on the lot.",
      });
   } else {
      let newCar = newCars.filter((car) => car.id === carID);
      res.status(200).json({ msg: "Here's your NEW car:", newCar });
   }
});

module.exports = router;
