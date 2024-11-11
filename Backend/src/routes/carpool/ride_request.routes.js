import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { reuqestride } from "../../controllers/carpool/request.controller.js";
const RideRequestRouter = Router();

RideRequestRouter.route("/ride/request").post(AuthenticateToken, reuqestride);

export default RideRequestRouter;