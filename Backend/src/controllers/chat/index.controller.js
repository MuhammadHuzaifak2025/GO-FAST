import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const fetchride_request = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const checkDriver = await sequelize.query(
            `SELECT * FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id 
             WHERE b.driver = ? and b.ride_status != 'completed'`,
            {
                replacements: [user_id],
                type: QueryTypes.SELECT,
            }
        );
        if (checkDriver.length > 0) {
            const ride_request = await sequelize.query(
                `SELECT * FROM ride_requests WHERE ride_id = ${checkDriver[0].ride_id}`,
                {
                    type: QueryTypes.SELECT,
                }
            )
            return res.json(new ApiResponse(res, ride_request));
        }
        const ride_request = await sequelize.query(
            `SELECT * FROM ride_requests WHERE requesting_user = ${user_id}`,
            {
                type: QueryTypes.SELECT,
            }
        );
        if (ride_request.length === 0) {
            return next(new ApiError(400, "No ride request found"));
        }
        return res.json(new ApiResponse(200, ride_request));
    }
    catch (error) {
        next(error);
    }
});

export { fetchride_request };