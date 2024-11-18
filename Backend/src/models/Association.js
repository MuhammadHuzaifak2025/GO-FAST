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
import Transport_Organization from "./Transport_Organization/index.model.js";
import Bus from "./Buspool/Bus.model.js";
import BusRoutes from "./Buspool/BusRoutes.model.js";
import semester from "./Buspool/semester.model.js";
import semester_passenger from "./Buspool/semester_passenger.model.js";
// import BusSemesterRide from "./Buspool/Bus_semester_ride.model.js";
import SingleRidePassenger from "./Buspool/single_ride_passenger.model.js";
import BusSingleRide from "./Buspool/Bus_Single_ride.model.js";


const syncModels = async () => {
  try {
    // console.log(sequelize)
    await sequelize.sync({ force: false });

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
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
  let username1 = "admin";
  try {
    const userexsist = await User.findOne({ where: { username: username1 } });
    if (!userexsist) {
      const Users = await User.create({
        username: "admin",
        email: "admin",
        password: "admin",
        phone: "admin",
        address: "admin",
        is_verified: true,
        admin: true,
      });
    }
  } catch (error) {
    console.log(error)
  }
};

export default syncModels;
