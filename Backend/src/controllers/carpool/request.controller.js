import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const create_request = asynchandler(async (req, res, next) => {
    try {
        const { rideId,seats } = req.body;

        const user_id = req.user.user_id;

        if (!rideId) {
            return next(new ApiError(400, "Please provide a ride id"));
        }
        if(seats <= 0){
            return next(new ApiError(400, "Seats requested should be greater than 0"));
        }

        let newSeats;
        if (!seats) {
            newSeats = 1;
        }
        else{
            newSeats = seats;
        }

        const approved = false;

        const alreadyRequested = await sequelize.query('SELECT b.ride_id, b.driver, a.Request_id, b.seat_available FROM carpool_rides b left outer join ride_requests a on a.ride_id = b.ride_id WHERE b.ride_id = ? AND a.requesting_user = ?', {
            replacements: [rideId, user_id],
            type: QueryTypes.SELECT
        });

        if (alreadyRequested[0]) {
            // console.log('3',alreadyRequested[0].request_id);
            if(alreadyRequested[0].is_approved === true){
                return next(new ApiError(400, "You have already been approved for this ride"));
            }
            else{
                return next(new ApiError(400, "you have already sent a request for this ride before"));
            }
        }

        const ride_details = await sequelize.query('SELECT b.ride_id, b.driver, b.seat_available FROM carpool_rides b WHERE b.ride_id = ?', {
            replacements: [rideId],
            type: QueryTypes.SELECT
        });

        if (ride_details[0].driver === user_id) {
            return next(new ApiError(400, "You can't request your own ride"));
        }
        if (ride_details[0].seat_available < newSeats) {
            return next(new ApiError(400, "Seats requested are more than available seats"));
        }

        const ride = await sequelize.query(
            `INSERT INTO ride_requests (ride_id, requesting_user, is_approved, "createdAt", "updatedAt", seats_requested) 
             VALUES (?,?,?,?,?,?) RETURNING *`,
            {
                replacements: [rideId, user_id, approved, new Date(), new Date(), newSeats],
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
            return next(new ApiError(400, "Please provide a request id"));
        }
        console.log(requestId)
        const ride_details = await sequelize.query(
            `SELECT a.request_id,a.ride_id,a.is_approved,a.seats_requested, b.driver, b.seat_available, a.requesting_user FROM ride_requests a inner join carpool_rides b on a.ride_id = b.ride_id WHERE request_id = ?`,
            {
                replacements: [requestId],
                type: QueryTypes.SELECT,
            });

        if (!ride_details[0]) {
            return next(new ApiError(400, "No ride requests found"));
        }
        console.log(ride_details[0])
        if (ride_details[0].requesting_user !== req.user.user_id) {
            return next(new ApiError(400, "You can't delete this request"));
        }
        if (ride_details[0].is_approved) {
            return next(new ApiError(400, "Ride request already accepted"));
        }

        const ride = await sequelize.query(
            `DELETE FROM ride_requests WHERE request_id = ?`,
            {
                replacements: [requestId],
                type: QueryTypes.DELETE,
            });
        console.log(ride)
        if (!ride) {
            return next(new ApiError(400, "No ride requests found"));
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

const fetch_pending_requests = asynchandler(async (req, res, next) => {
   
    try {
        
        const user_id = req.user.user_id;  

        const requests = await sequelize.query(
            `select a.*,d.*,b.*,c.username from ride_requests a JOIN carpool_rides b ON a.ride_id = b.ride_id JOIN users c ON b.driver = c.user_id JOIN carpool_vehicles d ON b.vehicle_id = d.vehicle_id WHERE requesting_user = ? AND is_approved = ${false}`,
            {
                replacements: [user_id],
                type: QueryTypes.SELECT,
            });
        
        if (!requests) {
            return next(new ApiError(400, "No pending requests found"));
        }

        return res.json(new ApiResponse(200, "Ride requests fetched successfully", requests));
    } catch (error) {
        next(error);
    }
});

const fetch_ride_requests_by_ride_id = asynchandler(async (req, res, next) => {
    try {

        const { rideId } = req.params;
        const user_id = req.user.user_id;  

        if (!rideId) {
            return next(new ApiError(400, "Please provide a ride id"));
        }
        const driver = await sequelize.query(
            `SELECT driver FROM carpool_rides WHERE ride_id = ?`,
            {
                replacements: [rideId],
                type: QueryTypes.SELECT,
            }); 
        if (!driver) {
            return next(new ApiError(400, "No ride requests found"));
        }
        if (driver[0].driver !== user_id) {
            return next(new ApiError(400, "You can't view requests for this ride"));
        }

        const ride = await sequelize.query(
            `select a.*,b.username from ride_requests a JOIN users b ON a.requesting_user = b.user_id where ride_id = ? AND is_approved = ${false}`,
            {
                replacements: [rideId],
                type: QueryTypes.SELECT,
            });
        if (!ride) {
            return next(new ApiError(400, "No ride requests found"));
        }
        return res.json(new ApiResponse(200, "Ride requests fetched successfully", ride));
    } catch (error) {
        next(error);
    }
});

const accept_ride_request = asynchandler(async (req, res, next) => {

    const transaction = await sequelize.transaction(); // Start a transaction
    
    try {

        const { requestId } = req.body;
        if (!requestId) {
            return next(new ApiError(400, "Please provide a request id"));
        }
        const ride_details = await sequelize.query(
            `SELECT a.request_id,a.ride_id,a.is_approved,a.seats_requested, b.driver, b.seat_available FROM ride_requests a inner join carpool_rides b on a.ride_id = b.ride_id WHERE request_id = ?`,
            {
                replacements: [requestId],
                type: QueryTypes.SELECT,
            });

        if (!ride_details[0]) {
            return next(new ApiError(400, "No ride requests found"));
        }
        if (ride_details[0].driver !== req.user.user_id) {
            return next(new ApiError(400, "You can't accept this request"));
        }
        if (ride_details[0].is_approved) {
            return next(new ApiError(400, "Ride request already accepted"));
        }
        
        
        const ride = await sequelize.query(
            `UPDATE ride_requests SET is_approved = ${true} WHERE request_id = ? RETURNING *`,
            {
                replacements: [requestId],
                type: QueryTypes.UPDATE,
            });
        

        const rides_seats = await sequelize.query(
            `UPDATE carpool_rides SET seat_available = seat_available - ${ride_details[0].seats_requested} WHERE ride_id = ? RETURNING *`,
            {
                replacements: [ride[0][0].ride_id],
                type: QueryTypes.UPDATE,
                transaction
            });

        if (rides_seats[0][0].seats_available < 0) {
            await transaction.rollback();  

            const delete_request = await sequelize.query(`DELETE FROM ride_requests WHERE request_id = ?`, 
            {
                replacements: [requestId],
                type: QueryTypes.DELETE,
                transaction
            }
            );
            return next(new ApiError(400, "No seats available"));
        }

        
        const ride_passenger = await sequelize.query(
            `INSERT INTO ride_passengers (ride_id, passenger_id, "createdAt", "updatedAt", seats_occupied) 
                 VALUES (?,?,?,?) RETURNING *`,
                 {
                replacements: [ride[0][0].ride_id, ride[0][0].requesting_user, new Date(), new Date(), ride_details[0].seats_requested],
                type: QueryTypes.INSERT,
                transaction
            });

        if (ride_passenger[0].length == 0) {

            return next(new ApiError(400, "Ride request not accepted"));
        }

        await transaction.commit();
            
        if(rides_seats[0][0].seat_available === 0){

            const delete_request = await sequelize.query(`DELETE FROM ride_requests WHERE ride_id = ?`,
            {
                replacements: [ride[0][0].ride_id],
                type: QueryTypes.DELETE,
            });
            const change_ride_status = await sequelize.query(`UPDATE carpool_rides SET ride_status = 'in_progress' WHERE ride_id = ?`,    
            {
                replacements: [ride[0][0].ride_id],
                type: QueryTypes.UPDATE,
            });
            return res.json(new ApiResponse(200, "Request accepted. Remaining requests auto-rejected as seats are filled.", ride[0]));
        }
        else{
            return res.json(new ApiResponse(200, "Ride request accepted successfully", ride[0]));
        }
        
    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

const reject_ride_request = asynchandler(async (req, res, next) => {
    try {
        const { requestId } = req.params;
        if (!requestId) {
            return next(new ApiError(400, "Please provide a request id"));
        }
        console.log(requestId)
        const ride_details = await sequelize.query(
            `SELECT a.request_id,a.ride_id,a.is_approved,a.seats_requested, b.driver, b.seat_available, a.requesting_user FROM ride_requests a inner join carpool_rides b on a.ride_id = b.ride_id WHERE request_id = ?`,
            {
                replacements: [requestId],
                type: QueryTypes.SELECT,
            });

        if (!ride_details[0]) {
            return next(new ApiError(400, "No ride requests found"));
        }
        console.log(ride_details[0])
        if (ride_details[0].driver !== req.user.user_id) {
            return next(new ApiError(400, "You can't reject this request"));
        }

        const ride = await sequelize.query(
            `DELETE FROM ride_requests WHERE request_id = ?`,
            {
                replacements: [requestId],
                type: QueryTypes.DELETE,
            });
        console.log(ride)
        if (!ride) {
            return next(new ApiError(400, "No ride requests found"));
        }
        return res.json(new ApiResponse(200, "Ride request rejected successfully", ride[0]));
    } catch (error) {
        next(error);
    }
});

export { create_request, fetch_ride_requests_by_ride_id, accept_ride_request, delete_ride_request, fetch_pending_requests, reject_ride_request };