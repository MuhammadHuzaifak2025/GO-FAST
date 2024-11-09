import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { CreateRide, GetRides, delete_ride, complete_ride } from "../../controllers/carpool/ride.controller.js";

const RideRouter = Router();

RideRouter.route("/ride").post(AuthenticateToken, CreateRide);
RideRouter.route("/rides").get(AuthenticateToken, GetRides);
RideRouter.route("/ride/complete").put(AuthenticateToken, complete_ride);
RideRouter.route("/ride/:ride_id").delete(AuthenticateToken, delete_ride);

export default RideRouter;
