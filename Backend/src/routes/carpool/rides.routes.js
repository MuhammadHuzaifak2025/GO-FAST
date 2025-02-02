import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { CreateRide, GetRides, delete_ride, complete_ride, fetch_user_ride, fetch_ride_passengers, delete_ride_passenger, fetchongoingride, ride_history } from "../../controllers/carpool/ride.controller.js";

const RideRouter = Router();

RideRouter.route("/ride").post(AuthenticateToken, CreateRide);
RideRouter.route("/rides/:page?/:limit?").get(AuthenticateToken, GetRides);
RideRouter.route("/ride/complete").put(AuthenticateToken, complete_ride);
RideRouter.route("/ride/:ride_id").delete(AuthenticateToken, delete_ride);
RideRouter.route("/ride/user").get(AuthenticateToken, fetch_user_ride);
RideRouter.route("/ride/user/passenger/:ride_id").get(AuthenticateToken, fetch_ride_passengers);
RideRouter.route("/ride/user/passenger/:ride_id/:passenger_id").delete(AuthenticateToken, delete_ride_passenger);
RideRouter.route("/ride/ongoing").get(AuthenticateToken, fetchongoingride);
RideRouter.route("/ride/history").get(AuthenticateToken, ride_history);


export default RideRouter;
