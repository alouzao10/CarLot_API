// Building a REST API to get information about a Car
// Take in data about a Car and return its value based on provided attributes

const express = require("express");
const logger = require("./middleware/logger.js");
const PORT_NUM = 3000;
const app = express();

app.use(logger);

app.use("/used", require("./routes/usedcars.js"));

app.get("/", (req, res) => {
   res.status(200).send("Welcome to the Car Lot!");
});

app.listen(PORT_NUM, () => {
   console.log(`Server running on port: ${PORT_NUM}`);
});
