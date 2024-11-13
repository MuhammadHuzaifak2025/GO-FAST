import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const reuqestride = asynchandler(async (req, res, next) => {
    try {
        const { rideId } = req.body;
        const user_id = req.user.user_id;
        console.log(user_id)
        if (!rideId) {
            return next(new ApiError(401, "Please provide a ride id"));
        }
        const approved = false;


        const alreadyRequested = await sequelize.query('SELECT b.ride_id, b.driver, a.Request_id FROM carpool_rides b left outer join ride_requests a on a.ride_id = b.ride_id WHERE b.ride_id = ? OR a.requesting_user = ?', {
            replacements: [rideId, user_id],
            type: QueryTypes.SELECT
        });
         
        console.log(alreadyRequested)
        if (!alreadyRequested || alreadyRequested.length > 0) {
            return next(new ApiError(401, ["You have already requested this ride, Request_id is : ", alreadyRequested[0].request_id]));
        }
        
        if (alreadyRequested[0].driver == user_id) {
            return next(new ApiError(401, "You can't request your own ride"));
        }

        const ride = await sequelize.query(
            `INSERT INTO ride_requests (ride_id, requesting_user, is_approved, "createdAt", "updatedAt") 
             VALUES (?,?,?,?,?) RETURNING *`,
            {
                replacements: [rideId, user_id, approved, new Date(), new Date()],
                type: QueryTypes.INSERT,
            });

        return res.json(new ApiResponse(200, "Ride requested successfully", ride[0]));
    } catch (error) {
        next(error);
    }
});

const delete_ride_request = asynchandler(async (req, res, next) => {
    try {
        const { requestId } = req.params;
        if (!requestId) {
            return next(new ApiError(401, "Please provide a request id"));
        }
        console.log(requestId)
        const ride = await sequelize.query(
            `DELETE FROM ride_requests WHERE request_id = ? RETURNING *`,
            {
                replacements: [requestId],
                type: QueryTypes.DELETE,
            });
            console.log(ride)
        if (!ride) {
            return next(new ApiError(401, "No ride requests found"));
        }
        return res.json(new ApiResponse(200, "Ride request deleted successfully", ride[0]));
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
        // console.log(ride[0])

        return res.json(new ApiResponse(200, "Ride requests fetched successfully", ride[0]));
    } catch (error) {
        next(error);
    }
});

const fetch_ride_requests_by_ride_id = asynchandler(async (req, res, next) => {
    try {
        const { rideId } = req.body;
        if (!rideId) {
            return next(new ApiError(401, "Please provide a ride id"));
        }
        const ride = await sequelize.query(
            `select * from ride_requests where ride_id = ?`,
            {
                replacements: [rideId],
                type: QueryTypes.SELECT,
            });
        if (!ride) {
            return next(new ApiError(401, "No ride requests found"));
        }
        return res.json(new ApiResponse(200, "Ride requests fetched successfully", ride));
    } catch (error) {
        next(error);
    }
});

const accept_ride_request = asynchandler(async (req, res, next) => {
    try {
        const { requestId } = req.body;
        if (!requestId) {
            return next(new ApiError(401, "Please provide a request id"));
        }
        const ride_details = await sequelize.query(
            `SELECT a.request_id,a.ride_id,a.is_approved, b.driver, b.seat_available FROM ride_requests a inner join carpool_rides b on a.ride_id = b.ride_id WHERE request_id = ?`,
            {
                replacements: [requestId],
                type: QueryTypes.SELECT,
            });

        if (!ride_details[0]) {
            return next(new ApiError(401, "No ride requests found"));
        }
        if (ride_details[0].driver !== req.user.user_id) {
            return next(new ApiError(401, "You can't accept or create your own request"));
        }
        if (ride_details[0].is_approved) {
            return next(new ApiError(401, "Ride request already accepted"));
        }

        const ride = await sequelize.query(
            `UPDATE ride_requests SET is_approved = ${true} WHERE request_id = ? RETURNING *`,
            {
                replacements: [requestId],
                type: QueryTypes.UPDATE,
            });

        const rides_seats = await sequelize.query(
            `UPDATE carpool_rides SET seat_available = seat_available - 1 WHERE ride_id = ? RETURNING *`,
            {
                replacements: [ride[0][0].ride_id],
                type: QueryTypes.UPDATE,
            });
        if (rides_seats[0][0].seats_available < 0) {
            return next(new ApiError(401, "No seats available"));
        }
        const ride_passenger = await sequelize.query(
            `INSERT INTO ride_passengers (ride_id, passenger_id, "createdAt", "updatedAt") 
                 VALUES (?,?,?,?) RETURNING *`,
            {
                replacements: [ride[0][0].ride_id, ride[0][0].requesting_user, new Date(), new Date()],
                type: QueryTypes.INSERT,
            });
        if (ride_passenger[0].length == 0) {
            return next(new ApiError(401, "Ride request not accepted"));
        }
        return res.json(new ApiResponse(200, "Ride request accepted successfully", ride[0]));
    } catch (error) {
        next(error);
    }
});

export { reuqestride, fetch_ride_requests_by_ride_id, accept_ride_request, delete_ride_request };