import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import {
    getbusroutes,
    create_bus,
    add_routes_to_bus,
    get_all_buses,
    get_all_buses_with_routes
} from "../../controllers/Buspool/Bus.controller.js";

const BusRouter = Router();

BusRouter.route("/bus").post(AuthenticateToken, create_bus);
BusRouter.route("/bus").get(AuthenticateToken, get_all_buses);
BusRouter.route("/bus/routes").post(AuthenticateToken, add_routes_to_bus);
BusRouter.route("/bus/routes").get(AuthenticateToken, getbusroutes);
BusRouter.route("/bus/routes/all/:transport_organizer?").get(AuthenticateToken, get_all_buses_with_routes);

export default BusRouter;