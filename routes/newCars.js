// Set the express environment
const express = require("express");
// Create an instance of the router to communicate with the app
const router = express.Router();

// Load in the data of new cars to use
var newCars = require("../data/NewCars.js");

// Home path for the new cars route
router.get("/", (req, res) => {
   // http://localhost:3000/new

   res.status(200).json(newCars);
});

// Return a car from the NewCars data source based on the given id of the car
router.get("/car/:id", (req, res) => {
   // http://localhost:3000/new/car/4

   let carID = parseInt(req.params.id);
   let carFound = newCars.some((car) => car.id === carID);
   if (!carFound) {
      res.status(400).json({
         msg: "ERROR: The car was not found on the lot.",
      });
   } else {
      let newCar = newCars.filter((car) => car.id === carID);
      res.status(200).json({ msg: "Here's a car:", newCar });
   }
});

// Return the bought new car given a make and model if one exists from the newCars data source
router.get("/car/buy/:make/:model", (req, res) => {
   // http://localhost:3000/new/car/buy/Tesla/Model 3

   let { make, model } = req.params;
   let carFound = newCars.some(
      (car) => car.make === make && car.model === model
   );
   if (!carFound) {
      res.status(400).json({
         msg: "ERROR: The new car was not found on the lot.",
      });
   } else {
      let boughtCar = newCars.filter(
         (car) => car.make === make && car.model === model
      );
      newCars = newCars.filter(
         (car) => car.make !== make && car.model !== model
      );
      res.status(200).json({
         msg: "Here's your BRAND NEW car:",
         boughtCar: boughtCar[0],
      });
   }
});

// Export the route to the app for access
module.exports = router;
