import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const delete_ride_passenger = asynchandler(async (req, res, next) => {
    try {
        const { ride_id, passenger_id } = req.params;
        const ride = await sequelize.query(
            `select * from carpool_rides where ride_id = ?`,
            {
                replacements: [ride_id],
                type: QueryTypes.SELECT,
            });
        if (!ride[0]) {
            throw new ApiError(404, "Ride not found");
        }
        const ride_passenger = await sequelize.query(
            `select * from ride_passengers where passenger_ride_id = ?`,
            {
                replacements: [passenger_id],
                type: QueryTypes.SELECT,
            });
        if (!ride_passenger[0]) {
            throw new ApiError(404, "Passenger not found");
        }
        await sequelize.query(
            `delete from ride_requests where ride_id = ? and requesting_user = ?`,
            {
                replacements: [ride_id, passenger_id],
                type: QueryTypes.DELETE,
            });
        await sequelize.query(
            `update carpool_rides set available_seats = available_seats + 1 where ride_id = ?`,
            {
                replacements: [ride_id],
                type: QueryTypes.UPDATE,
            });
        await sequelize.query(
            `update ride_requests set is_accepted = 0 where ride_id = ?`,
            {
                replacements: [ride_id],
                type: QueryTypes.UPDATE,
            });
        return ApiResponse(res, 200, "Passenger removed successfully");
    } catch (error) {
        next(error);
    }
});

export { delete_ride_passenger };