import { Router } from "express";
import AuthenticateToken from "../middlewares/Authenticate_token.js";
import { create_Transport_Manager } from "../controllers/Buspool/Transport.controller.js";

const Trasport_Manager = Router();

Trasport_Manager.route("/transport_manager").post(AuthenticateToken, create_Transport_Manager);

export default Trasport_Manager;