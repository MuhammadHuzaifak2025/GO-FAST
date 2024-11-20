import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import {
    openbusregistration,
    getbusregistration,
    showstudentregistration,
    get_student_registrations
}
    from "../../controllers/Buspool/BusRegistration.js";

const BusRegistrationRouter = Router();

BusRegistrationRouter.route("/busregistration").post(AuthenticateToken, openbusregistration);
BusRegistrationRouter.route("/busregistration").get(AuthenticateToken, getbusregistration);
BusRegistrationRouter.route("/busregistration/show").get(AuthenticateToken, showstudentregistration);
BusRegistrationRouter.route("/busregistration/student").get(AuthenticateToken, get_student_registrations);

export default BusRegistrationRouter;