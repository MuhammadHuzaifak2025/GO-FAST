import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { CreateRide } from "../../controllers/carpool/ride.controller.js";

const RideRouter = Router();

RideRouter.route("/ride").post(AuthenticateToken, CreateRide);

export default RideRouter;
