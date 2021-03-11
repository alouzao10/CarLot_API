====== Welcome to the Car Lot API ======

-The purpose of this API is to provide information on available cars on the lot both used an old.

-You will have access to search for exisisting cars based on an id or a variety of parameters.

-Use the following paths/routes to access the information provided by the API.

=========================================
-"/" = Home Route
=========================================
-"/new" = New Cars Route
-"/new/" = Returns the available new cars from the NewCars data source.
-"/new/car/:id" = Returns a new car based on its id, if one exists, from the NewCars data source.
-"/new/car/buy/:make/:model" = Removes the bought new car from the lot, returns the bought car, and removes it from the NewCars data source.
=========================================
-"/used" = Used Cars Route
-"/used/" = Returns the available used cars from the UsedCars data source.
-"/used/car/:id" = Returns a used car based on its id, if one exists, from the UsedCars data source.
-"/used/value/:id" = Calculates the new value of the used car based on the given used car id for the record that exists in the UsedCars data source.
-"/used/value/:value/:make/:model/:age/:owners" = Calculates the new value of the used car based on the given route parameters that make up the used car. Allows additional values through a provided query string that effect the new value if provided.
-"/used/car/buy/:make/:model" = Removes the bought used car from the lot, returns the bought car, and removes it from the UsedCars data source.
