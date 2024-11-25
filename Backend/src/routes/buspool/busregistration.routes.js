import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import {
    openbusregistration,
    getbusregistration,
    showstudentregistration,
    get_student_registrations,
    get_openreg_busses_with_routes,
    get_busPassenger_ifregistered,
    updateduedate
}
    from "../../controllers/Buspool/BusRegistration.js";
import { show_card } from "../../controllers/Buspool/BusPassenger.controller.js";

const BusRegistrationRouter = Router();

BusRegistrationRouter.route("/busregistration").post(AuthenticateToken, openbusregistration);
BusRegistrationRouter.route("/busregistration").get(AuthenticateToken, getbusregistration);
BusRegistrationRouter.route("/busregistration/show").get(AuthenticateToken, showstudentregistration);
BusRegistrationRouter.route("/busregistration/student").get(AuthenticateToken, get_student_registrations);
BusRegistrationRouter.route("/busregistration/open").get(AuthenticateToken, get_openreg_busses_with_routes);
BusRegistrationRouter.route("/busregistration/passenger").get(AuthenticateToken, get_busPassenger_ifregistered);
BusRegistrationRouter.route("/busregistration/updateduedate").put(AuthenticateToken, updateduedate);
BusRegistrationRouter.route("/busregistration/card").get(AuthenticateToken, show_card);

export default BusRegistrationRouter;