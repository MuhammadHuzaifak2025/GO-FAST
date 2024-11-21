import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { create_request, fetch_ride_requests_by_ride_id, accept_ride_request, delete_ride_request, fetch_pending_requests, reject_ride_request } from "../../controllers/carpool/request.controller.js";
const RideRequestRouter = Router();

RideRequestRouter.route("/ride/request").post(AuthenticateToken, create_request);
RideRequestRouter.route("/ride/request/:rideId").get(AuthenticateToken, fetch_ride_requests_by_ride_id);
RideRequestRouter.route("/ride/request/accept").post(AuthenticateToken, accept_ride_request);
RideRequestRouter.route("/ride/request/reject/:requestId").delete(AuthenticateToken, reject_ride_request);
RideRequestRouter.route("/ride/request/:requestId").delete(AuthenticateToken, delete_ride_request);
RideRequestRouter.route("/ride/requests/pending").get(AuthenticateToken, fetch_pending_requests);

export default RideRequestRouter;