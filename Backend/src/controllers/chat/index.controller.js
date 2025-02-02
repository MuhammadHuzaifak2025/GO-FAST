import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const fetchride_request = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const checkDriver = await sequelize.query(
            `SELECT a.*, b.* ,c.username, c.user_id FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id
             inner join users c on a.requesting_user = c.user_id 
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

        }
        const ride_request = await sequelize.query(
            `SELECT a.*, b.username, b.user_id, c.* FROM ride_requests a
            inner join carpool_rides c on a.ride_id = c.ride_id
            inner join users b on b.user_id = c.driver
            WHERE requesting_user = ${user_id} AND
            c.ride_status != 'completed'`,
            {
                type: QueryTypes.SELECT,
            }
        );
        if (ride_request.length === 0 && checkDriver.length === 0) {
            return next(new ApiError(400, "No ride request found"));
        }
        return res.json(new ApiResponse(200, { "Driver": checkDriver, "Passenger": ride_request }));
    }
    catch (error) {
        next(error);
    }
});

export { fetchride_request };