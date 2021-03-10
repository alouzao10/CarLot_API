// Building a REST API to get information about a Car
// Take in data about a Car and return its value based on provided attributes

// Set up the express environment
const express = require("express");

// Bring in the externam middleware to log the request urls
const logger = require("./middleware/logger.js");

// Set the port number for the server to listen to
const PORT_NUM = 3000;

// Create a new instance of the express server
const app = express();

// Bring in the logger middleware to use within the app
app.use(logger);

// Connect the external routes for use within the app
app.use("/new", require("./routes/newCars.js"));
app.use("/used", require("./routes/usedCars.js"));

app.get("/", (req, res) => {
   res.status(200).send("Welcome to the Car Lot!");
});

// Start up the server by letting it listen to the assigned port number
app.listen(PORT_NUM, () => {
   console.log(`Server running on port: ${PORT_NUM}`);
});
