import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import {
    RequestforSingleRide, fetch_my_single_ride_passengers, approveSingleRidePassenger, reject_single_ride_passenger, showSingleRideBusses_toUser, showSingleRidePassenger_toAdmin,

} from "../../controllers/Buspool/SingleRidePassenger.controller.js"

const SingleRidePassengerRouter = Router();

SingleRidePassengerRouter.route("/singleridepassenger").post(AuthenticateToken, RequestforSingleRide);
SingleRidePassengerRouter.route("/singleridepassenger").get(AuthenticateToken, showSingleRidePassenger_toAdmin);
SingleRidePassengerRouter.route("/singleridepassenger/approve/:single_ride_passenger_id").put(AuthenticateToken, approveSingleRidePassenger);
SingleRidePassengerRouter.route("/singleridepassenger/reject/:single_ride_passenger_id").delete(AuthenticateToken, reject_single_ride_passenger);
SingleRidePassengerRouter.route("/singleridepassenger/show").get(AuthenticateToken, showSingleRideBusses_toUser);
SingleRidePassengerRouter.route("/singleridepassenger/myrides").get(AuthenticateToken, fetch_my_single_ride_passengers);

export default SingleRidePassengerRouter;