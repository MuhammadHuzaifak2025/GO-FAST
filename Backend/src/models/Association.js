import sequelize from "../database/index.js";
import User from "../models/user.models.js";
import carpool_vehicle from "./carpool_vehicle.models.js";
import CarpoolRide from "./carpool_ride.models.js";
import Route from "./routes.models.js";


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
