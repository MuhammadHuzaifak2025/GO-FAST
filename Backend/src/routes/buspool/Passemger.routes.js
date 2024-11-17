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

PassengerRouter.post("/create-semester", AuthenticateToken, create_Semester);
PassengerRouter.get("/get-semesters", AuthenticateToken, get_Semesters);
PassengerRouter.post("/register-semester-passenger", AuthenticateToken, register_Semester_Passenger);
PassengerRouter.get("/get-semester-passengers", AuthenticateToken, get_Semester_Passengers);
PassengerRouter.get("/get-bill", AuthenticateToken, getBill);
PassengerRouter.post("/pay-semester-passenger", AuthenticateToken, pay_Semester_Passenger);

export default PassengerRouter;