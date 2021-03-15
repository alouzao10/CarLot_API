// Set the express environment
const express = require("express");
// Create an instance of the router to communicate with the app
const router = express.Router();

// Load in the fetch function to access the API data fetch
const fetch = require("node-fetch");

// Load in the data of used cars to use
var usedCars = require("../data/UsedCars.js");

// Set the url and option needed to use the external API
const API_URL = "https://vpic.nhtsa.dot.gov/api//vehicles/GetModelsForMake";
const API_FORMAT = "format=json";

// Home path for the used cars route
router.get("/", (req, res) => {
   // http://localhost:3000/used/
   res.status(200).json(usedCars);
});

// Get the used car based on the provided id
router.get("/car/:id", (req, res) => {
   // http://localhost:3000/used/car/3
   let carID = parseInt(req.params.id);
   let carFound = usedCars.some((car) => car.id === carID);
   if (!carFound) {
      res.status(404).json({
         msg: "ERROR: The used car was not found on the lot.",
      });
   } else {
      let usedCar = usedCars.filter((car) => car.id === carID);
      res.status(200).json({ msg: "Here's your USED car:", usedCar });
   }
});

// Calculate the Value of the car based on its attributes
// 1) Return the car from the list based on the provided id
// 2) Verify that the make and model are known checking against the provided API
//    https://vpic.nhtsa.dot.gov/api/getmodelsformake/{make}
// 3) Check the value of the owners to determine any effect on the value
// 4) Make calculations based on the factors for the other attributes
// 5) Send back the value of the used car
router.get("/value/:id", async (req, res) => {
   // http://localhost:3000/used/value/3

   // Capture the route parameter for the car id
   let carID = parseInt(req.params.id);
   // See if a car with a matching record with the same id
   let carFound = usedCars.some((car) => car.id === carID);
   if (!carFound) {
      // If a car record isn't found return an error
      res.status(404).json({
         msg: "ERROR: The used car was not found on the lot.",
      });
   } else {
      // If a car record is found pull the attributes of its record
      let car = usedCars.filter((car) => car.id === carID);
      // Break out each attribute and assign it to its own variable for use
      const { make, model, age, mileage, owners, collisions, value } = car[0];
      console.log(`${make} ${model}, Initial Value = $${value}`);
      // Call the API to check if the car's Make exists
      let foundMake = await fetch(`${API_URL}/${make}?${API_FORMAT}`)
         .then((ret) => ret.json())
         .then((data) => {
            return data;
         });
      if (foundMake.Count === 0) {
         // If the car's Make is not found return an error
         res.status(404).json({
            msg: `ERROR: Car id:${carID} make:${make} was not found in the system.`,
         });
      } else {
         // If the car's Make is found check if the Model is found
         let foundModel = foundMake.Results.some(
            (car) => car.Model_Name.toLowerCase() === model.toLowerCase()
         );
         if (!foundModel) {
            // If the car's Model is not found return an error
            res.status(404).json({
               msg: `ERROR: Car id:${carID} make:${make} model:${model} was not found in the system.`,
            });
         } else {
            // If the car's Model is found proceed with value calculation
            let carValue = calculateValue(
               age,
               mileage,
               owners,
               collisions,
               value
            );

            console.log(`${make} ${model}, Final Value = $${carValue}`);

            // Return the new value as a result of the calculations
            res.status(200).json({
               msg: `SUCCESS: New Value For Your: ${make} ${model}`,
               value: carValue,
            });
         }
      }
   }
});

// An alternative path to calculate the same value for a given car
router.get("/value/:value/:make/:model/:age/:owners", async (req, res) => {
   // http://localhost:3000/used/value/34560/Honda/Civic/62/2?mileage=55890&collisions=1

   // Capture the mandatory route parameter for the car
   let params = req.params;
   const value = parseFloat(params.value);
   const make = params.make;
   const model = params.model;
   const age = parseInt(params.age);
   const owners = parseInt(params.owners);

   // Capture the optional route parameters for the car from the query string
   let queryString = req.query;
   const mileage = queryString.mileage ? parseInt(queryString.mileage) : 0;
   const collisions = queryString.collisions
      ? parseInt(queryString.collisions)
      : 0;

   console.log(`${make} ${model}, Initial Value = $${value}`);
   // Call the API to check if the car's Make exists
   let foundMake = await fetch(`${API_URL}/${make}?${API_FORMAT}`)
      .then((ret) => ret.json())
      .then((data) => {
         return data;
      });
   if (foundMake.Count === 0) {
      // If the car's Make is not found return an error
      res.status(404).json({
         msg: `ERROR: The make:${make} was not found.`,
      });
   } else {
      // If the car's Make is found check if the Model is found
      let foundModel = foundMake.Results.some(
         (car) => car.Model_Name.toLowerCase() === model.toLowerCase()
      );
      if (!foundModel) {
         // If the car's Model is not found return an error
         res.status(404).json({
            msg: `ERROR: Car make:${make} model:${model} was not found in the system.`,
         });
      } else {
         // If the car's Model is found proceed with value calculation
         let carValue = calculateValue(age, mileage, owners, collisions, value);

         console.log(`${make} ${model}, Final Value = $${carValue}`);

         // Return the new value as a result of the calculations
         res.status(200).json({
            msg: `SUCCESS: New Value For Your: ${make} ${model}`,
            value: carValue,
         });
      }
   }
});

// Function used to calculate the new value of the car
// The same calculation is shared between the two paths to get the value
function calculateValue(age, mileage, owners, collisions, value) {
   let finalValue = 0.0;
   // Check the number of Owners
   // If more than 2 owners, reduce initial value by 25% (0.25)
   if (owners >= 2) {
      // Start by updating the initial value;
      finalValue = value - value * 0.25;
      //console.log("After 2+ Owners = ", finalValue);
   } else {
      // Set to the initial value
      finalValue = value;
   }

   // Check the Collisions
   // For every collision remove 2% (0.02) of its value up to 5 collisions
   // If 0, doesn't effect final value
   if (collisions > 0) {
      for (let i = 1; i <= collisions; i++) {
         if (i <= 5) {
            finalValue = finalValue - finalValue * 0.02;
         } else {
            break;
         }
      }
   }
   //console.log("After Collisions = ", finalValue);

   // Check the Mileage
   // Reduce the value by .2% (0.002) for every 1,000 miles
   // After the mileage reaches 150,000 miles its value can't be reduced
   // If 0, doesn't effect final value
   if (mileage > 0) {
      let totMiles = Math.floor(mileage / 1000) * 1000; // 999 -> 0, 1001 -> 1
      for (let i = 1; i <= totMiles / 1000; i++) {
         if (i <= 15) {
            finalValue = finalValue - finalValue * 0.002;
         } else {
            break;
         }
      }
   }
   //console.log("After Mileage = ", finalValue);

   // Check the Age
   // Given the number of months, reduce its value .5% (0.005) for each month
   // After 10 years, the value isn't reduced any further (10 years = 120 months)
   for (let i = 1; i <= age; i++) {
      if (i <= 120) {
         finalValue = finalValue - finalValue * 0.005;
      } else {
         break;
      }
   }
   //console.log("After Age = ", finalValue);

   // Check the number of Owners
   // If no previous owners (0 or 1 owner) add 10% (0.10) to the final value after all calculations
   if (owners === 1) {
      finalValue = finalValue + finalValue * 0.1;
      //console.log("After 1 or No Owners = ", finalValue);
   }
   return finalValue.toFixed(2);
}

// Return the bought used car given a make and model if one exists from the UsedCars data source
router.get("/car/buy/:make/:model", (req, res) => {
   let { make, model } = req.params;
   let carFound = usedCars.some(
      (car) => car.make === make && car.model === model
   );
   if (!carFound) {
      res.status(400).json({
         msg: "ERROR: The used car was not found on the lot.",
      });
   } else {
      let boughtCar = usedCars.filter(
         (car) => car.make === make && car.model === model
      );
      usedCars = usedCars.filter(
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
