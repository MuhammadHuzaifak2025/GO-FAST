
import { Router } from "express";
import AuthenticateToken from "../../middlewares/Authenticate_token.js";
import { get_bus_ratio, seatleft, get_this_month_rides_driver, get_this_month_passenger_spending, get_total_rides_driver, get_total_passenger_rides, get_monthly_stats } from "../../controllers/Stats/BusPool.controller.js";
const StatsRouter = Router();

StatsRouter.route("/stats/bus_ratio").get(AuthenticateToken, get_bus_ratio);
StatsRouter.route("/stats/seat_left").get(AuthenticateToken, seatleft);
StatsRouter.route("/stats/this_month_rides_driver").get(AuthenticateToken, get_this_month_rides_driver);
StatsRouter.route("/stats/this_month_passenger_spending").get(AuthenticateToken, get_this_month_passenger_spending);
StatsRouter.route("/stats/total_rides_driver").get(AuthenticateToken, get_total_rides_driver);
StatsRouter.route("/stats/total_passenger_rides").get(AuthenticateToken, get_total_passenger_rides);
StatsRouter.route("/stats/monthly_stats").get(AuthenticateToken, get_monthly_stats);



export default StatsRouter;