import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import {
    create_Semester,
    get_Semesters,
    register_Semester_Passenger,
    get_Semester_Passengers,
    getBill,
    pay_Semester_Passenger
} from "../../controllers/Buspool/BusPassenger.controller.js";

const PassengerRouter = Router();

PassengerRouter.post("/semester", AuthenticateToken, create_Semester);
PassengerRouter.get("/semesters", AuthenticateToken, get_Semesters);
PassengerRouter.post("/semester-passenger", AuthenticateToken, register_Semester_Passenger);
PassengerRouter.get("/semester-passengers", AuthenticateToken, get_Semester_Passengers);
PassengerRouter.get("/bill", AuthenticateToken, getBill);
PassengerRouter.post("/pay-semester-passenger", AuthenticateToken, pay_Semester_Passenger);
PassengerRouter.post("/busregistration/payment", AuthenticateToken, pay_Semester_Passenger);

export default PassengerRouter;