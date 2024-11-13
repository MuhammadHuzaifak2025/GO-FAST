import sequelize from "../database/index.js";
import User from "../models/user.models.js";
import carpool_vehicle from "./carpool/carpool_vehicle.models.js";
import CarpoolRide from "./carpool/carpool_ride.models.js";
import Route from "./carpool/routes.models.js";
import ride_passenger from "./carpool/ride_passenger.models.js";
import ride_request from "./carpool/ride_request.models.js";
import ride_routes from "./carpool/ride_routes.models.js";
import Chat from "./chatapp/chat.model.js";
import ChatMessage from "./chatapp/chat_message.model.js";


const syncModels = async () => {
  try {
    // console.log(sequelize)
    await sequelize.sync({ force: false });
    console.log("Creating user");
    const username = "abc";
    const userexsist = await User.findOne({ where: { username } });
    if (!userexsist) {
      const Users = await User.create({
        username: "abc",
        email: "abc",
        password: "abc",
        phone: "abc",
        address: "abc",
        is_verified: true,
      });
    }
    console.log("Models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
};

export default syncModels;
