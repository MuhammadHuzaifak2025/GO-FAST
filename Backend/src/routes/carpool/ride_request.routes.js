import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { reuqestride, fetch_ride_requests } from "../../controllers/carpool/request.controller.js";
const RideRequestRouter = Router();

RideRequestRouter.route("/ride/request").post(AuthenticateToken, reuqestride);
RideRequestRouter.route("/ride/request").get(AuthenticateToken, fetch_ride_requests);

export default RideRequestRouter;