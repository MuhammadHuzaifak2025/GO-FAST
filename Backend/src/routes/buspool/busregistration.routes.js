import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import {
    openbusregistration,
    getbusregistration,
    showstudentregistration,
    get_student_registrations,
    get_openreg_busses_with_routes
}
    from "../../controllers/Buspool/BusRegistration.js";

const BusRegistrationRouter = Router();

BusRegistrationRouter.route("/busregistration").post(AuthenticateToken, openbusregistration);
BusRegistrationRouter.route("/busregistration").get(AuthenticateToken, getbusregistration);
BusRegistrationRouter.route("/busregistration/show").get(AuthenticateToken, showstudentregistration);
BusRegistrationRouter.route("/busregistration/student").get(AuthenticateToken, get_student_registrations);
BusRegistrationRouter.route("/busregistration/open").get(AuthenticateToken, get_openreg_busses_with_routes);

export default BusRegistrationRouter;