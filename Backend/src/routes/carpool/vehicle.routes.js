import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { createVehicle, getVehicles, getvehicle, updateVehicle } from "../../controllers/carpool/vehicle.controller.js";


const Vehicle_Router = Router();

Vehicle_Router.route("/vehicle").post(AuthenticateToken, createVehicle);
Vehicle_Router.route("/vehicles").get(AuthenticateToken, getVehicles);
Vehicle_Router.route("/vehicle/:vehicle_id").get(AuthenticateToken, getvehicle);
Vehicle_Router.route("/vehicle/:vehicle_id").put(AuthenticateToken, updateVehicle);

export default Vehicle_Router;