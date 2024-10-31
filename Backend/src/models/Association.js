import sequelize from "../database/index.js";
import User from "../models/user.models.js";
import carpool_vehicle from "./carpool/carpool_vehicle.models.js";
import CarpoolRide from "./carpool/carpool_ride.models.js";
import Route from "./carpool/routes.models.js";
import ride_passenger from "./carpool/ride_passenger.models.js";
import ride_request from "./carpool/ride_request.models.js";
import ride_routes from "./carpool/ride_routes.models.js";


const syncModels = async () => {
  try {
    // console.log(sequelize)
    await sequelize.sync({ force: true });
    console.log("Models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
};

export default syncModels;
