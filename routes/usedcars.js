const express = require("express");
const router = express.Router();

const usedCars = require("../data/UsedCars.js");

const fetch = require("node-fetch");

router.get("/", (req, res) => {
   res.status(200).json(usedCars);
});

router.get("/value/:id", async (req, res) => {
   // Calculate the Value of the car based on its attributes
   // 1) Return the car from the list based on the provided id
   // 2) Verify that the make and model are known checking against the provided API
   // https://vpic.nhtsa.dot.gov/api/getmodelsformake/{make}
   // 3) Check the value of the owners to determine any effect on the value
   // 4) Make calculations based on the factors for the other attributes
   // 5) Send back the value of the used car

   let finalValue = 0;

   let carID = parseInt(req.params.id);
   let car = usedCars.filter((car) => car.id === carID);
   if (car.length === 0) {
      res.status(400).json({
         msg: "ERROR: Your car was not found on the lot.",
      });
   } else {
      const { make, model, age, mileage, owners, collisions, value } = car[0];
      console.log(make, model, ", Initial value = ", value);
      let foundMake = await fetch(
         `https://vpic.nhtsa.dot.gov/api//vehicles/GetModelsForMake/${make}?format=json`
      )
         .then((ret) => ret.json())
         .then((data) => {
            return data;
         });
      if (foundMake.Count === 0) {
         // Car Make is not found, respond with error
         res.status(400).json({
            msg: `ERROR: Car id:${carID} make:${make} was not found.`,
         });
      } else {
         // Car Make is found, check if Model is found
         let foundModel = foundMake.Results.some(
            (car) => car.Model_Name.toLowerCase() === model.toLowerCase()
         );
         if (!foundModel) {
            // Car Model is not found respond with error
            res.status(400).json({
               msg: `ERROR: Car id:${carID} model:${model} was not found.`,
            });
         } else {
            // Car Model is found and can continue with calculations

            // Check the number of Owners
            // If more than 2 owners, reduce initial value by 25%
            if (owners > 2) {
               // Update initial value;
               finalValue = value - value * 0.25;
               console.log("After 2+ Owners = ", finalValue);
            } else {
               finalValue = value;
            }
            // Check the collisions
            // For every collision remove 2% of its value up to 5 collisions
            // If 0, doesn't effect final value
            if (collisions > 0) {
               let collPercent;
               if (collisions <= 5) {
                  collPercent = 0.02 * collisions;
               } else {
                  collPercent = 0.1; // 0.02 * 5
               }
               finalValue = finalValue - finalValue * collPercent;

               /*for (let i = 1; i <= collisions; i++) {
                  if (i <= 5) {
                     finalValue = finalValue - finalValue * 0.02;
                  } else {
                     break;
                  }
               }*/
            }
            console.log("After Collisions = ", finalValue);

            // Check the mileage
            // Reduce the value by .002% for every 1,000 miles
            // After the mileage reaches 150,000 miles its value can't be reduced
            // If 0, doesn't effect final value
            if (mileage > 0) {
               let totMiles = Math.ceil(mileage / 1000) * 1000;
               let milePercent;
               if (totMiles === 1000) {
                  milePercent = 0.002;
               } else if (totMiles <= 150000) {
                  milePercent = 0.002 * (totMiles / 1000);
               } else {
                  milePercent = 0.3; // 0.002 * (150000 / 1000)
               }
               finalValue = finalValue - finalValue * milePercent;

               /*if (totMiles === 1000) {
                  finalValue = finalValue - finalValue * 0.002;
               } else {
                  for (let i = 1000; i < totMiles; i += 1000) {
                     if (i <= 150000) {
                        finalValue = finalValue - finalValue * 0.002;
                     } else {
                        break;
                     }
                  }
               }*/
            }
            console.log("After Mileage = ", finalValue);

            // Check the age
            // Given the number of months, reduce its value .5%
            // After 10 years, the value isn't reduced any further
            console.log("After Age = ", finalValue);

            // Check the number of owners
            // If less than 2 add 10% to the final value after all calculations
            if (owners <= 2) {
               finalValue = finalValue + finalValue * 0.1;
               console.log("After 1 or No Owners = ", finalValue);
            }

            res.status(200).json({
               msg: `New Value For Your: ${make} ${model}`,
               value: parseFloat(finalValue.toFixed(2)),
            });
         }
      }
   }
});

module.exports = router;
