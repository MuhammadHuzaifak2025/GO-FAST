import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const reuqestride = asynchandler(async (req, res, next) => {
    try {
        const { rideId } = req.body;
        const user_id = req.user.user_id;
        if (!rideId) {
            return next(new ApiError(401, "Please provide a ride id"));
        }
        const approved = false;
        // console.log(rideId, user_id, approved);
        const ride = await sequelize.query(
            `INSERT INTO ride_requests (ride_id, requesting_user, is_approved, "createdAt", "updatedAt") 
             VALUES (?,?,?,?,?) RETURNING *`,
            {
                replacements: [rideId, user_id, approved, new Date(), new Date()],
                type: QueryTypes.INSERT,
            });
        console.log(ride[0])

        return res.json(new ApiResponse(200, "Ride requested successfully", ride[0]));
    } catch (error) {
        next(error);
    }
});

const fetch_ride_requests = asynchandler(async (req, res, next) => {
    try {
        // const { rideId } = req.body;
        const ride = await sequelize.query(
            `select * from ride_requests `,
            {
                type: QueryTypes.SELECT,
            });
        console.log(ride[0])

        return res.json(new ApiResponse(200, "Ride requests fetched successfully", ride[0]));
    } catch (error) {
        next(error);
    }
});

export { reuqestride, fetch_ride_requests };