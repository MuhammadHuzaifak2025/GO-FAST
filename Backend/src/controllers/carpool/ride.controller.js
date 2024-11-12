import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const CreateRide = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const { vehicle_id, route, start_time, departure_date, price, seats } = req.body;
        if (!vehicle_id || !route || !start_time || !departure_date || !price || !seats) {
            return next(new ApiError(400, "Please fill in all fields"));
        }
        const vehicle = await sequelize.query(
            `SELECT * FROM carpool_vehicles WHERE vehicle_id = ? AND owner = ?`,
            {
                replacements: [vehicle_id, user_id],
                type: QueryTypes.SELECT,
            }
        );
        if (!vehicle[0]) {
            return next(new ApiError(400, "Vehicle not found"));
        }

        for (const routes of route) {
            if (!routes.route_name || !routes.longitude || !routes.latitude && route.length > 1) {
                return next(new ApiError(400, "Please fill in all fields in each route"));
            }
            else {
                const route_id = await sequelize.query(
                    'Select route_id from routes where route_name = ? and longitude = ? and latitude = ?',
                    {
                        replacements: [routes.route_name, routes.longitude, routes.latitude],
                        type: QueryTypes.SELECT,
                    }
                );
                if (route_id[0]) {
                    routes.route_id = route_id[0].route_id;
                }
                else {
                    const route = await sequelize.query(
                        `INSERT INTO routes ("route_name", "longitude", "latitude", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?)`,
                        {
                            replacements: [routes.route_name, routes.longitude, routes.latitude, new Date(), new Date()],
                            type: QueryTypes.INSERT,
                        }
                    );


                    if (route) {
                        routes.route_id = route[0];
                    } else {
                        throw new ApiError(400, "Failed to create route");
                    }
                }
            }
        }
        const ride = await sequelize.query(
            `INSERT INTO carpool_rides (vehicle_id, start_time, fare, seat_available, driver, "createdAt", "updatedAt", "ride_status") VALUES (?,?,?,?,?,?,?,?)
            RETURNING ride_id`,
            {
                replacements: [vehicle_id, start_time, price, seats, user_id, new Date(), new Date(), "available",],
                type: QueryTypes.INSERT,
            }
        );
        const newRideId = ride[0][0].ride_id;
        console.log(newRideId);
        if (ride) {
            let i = 0;
            for (const routes of route) {
                const ride_route = await sequelize.query(
                    `INSERT INTO ride_routes (ride_id, route_id,  "createdAt", "updatedAt", "order") VALUES (?,?,?,?,? )`,
                    {
                        replacements: [newRideId, routes.route_id, new Date(), new Date(), i],
                        type: QueryTypes.INSERT,
                    }
                );
                ++i;
                if (!ride_route) {
                    throw new ApiError(400, "Failed to create ride route");
                }
            }

            const routes = await sequelize.query(
                `SELECT * FROM routes WHERE route_id IN (SELECT route_id FROM ride_routes WHERE ride_id = ?)`,
                {
                    replacements: [newRideId],
                    type: QueryTypes.SELECT,
                }
            );
            const ride_details = await sequelize.query(
                `SELECT * FROM carpool_rides WHERE ride_id = ?`,
                {
                    replacements: [newRideId],
                    type: QueryTypes.SELECT,
                }
            );
            ride_details[0].routes = routes;
            ride_details[0].vehicle_id = undefined;
            ride_details[0].vehicle = vehicle[0];
            return res.status(201).json(new ApiResponse(201, "Ride created successfully", ride_details[0]));
        } else {
            throw new ApiError(400, "Failed to create ride");
        }
    } catch (error) {
        next(error);

    }
});

const GetRides = asynchandler(async (req, res, next) => {
    try {
        const page = parseInt(req.params.page) || 1; 
        const limit = parseInt(req.params.limit) || 10; 
        const offset = (page - 1) * limit;
        console.log(page, limit, offset);
        const rides = await sequelize.query(
            `SELECT * FROM carpool_rides 
            WHERE ride_status = 'available' 
            AND "createdAt" >= now() - interval '1 day' AND
            driver != ${req.user.user_id} 
            ORDER BY "createdAt" DESC 
            LIMIT ${limit} OFFSET ${offset}`,
            { type: QueryTypes.SELECT }
        );

        if (rides.length) {
    
            for (const rides_details of rides) {
                const vehicle = await sequelize.query(
                    `SELECT * FROM carpool_vehicles WHERE vehicle_id = ${rides_details.vehicle_id};`,
                    { type: QueryTypes.SELECT }
                );

                rides_details.vehicle = vehicle[0];
                rides_details.vehicle_id = undefined;

                const ride_routes = await sequelize.query(
                    `SELECT * FROM routes a 
                    INNER JOIN ride_routes AS b ON a.route_id = b.route_id 
                    WHERE ride_id = ${rides_details.ride_id} 
                    ORDER BY b.order`,
                    { type: QueryTypes.SELECT }
                );

                rides_details.routes = ride_routes;
            }

            return res.status(200).json(
                new ApiResponse(200, "Rides retrieved successfully", {
                    rides,
                    page,
                    limit,
                    totalRides: rides.length,
                })
            );
        } else {
            throw new ApiError(400, "No rides available");
        }
    } catch (error) {
        next(error);
    }
});


const complete_ride = asynchandler(async (req, res, next) => {
    try {
        const { ride_id } = req.body;
        if (!ride_id) {
            return next(new ApiError(400, "Please fill in all fields"));
        }
        const fetch_ride = await sequelize.query(
            `SELECT * FROM carpool_rides WHERE ride_id = ?`,
            { type: QueryTypes.SELECT, replacements: [ride_id] })

        if (!fetch_ride[0]) {
            return next(new ApiError(400, "Ride not found"));
        }
        if (fetch_ride[0].ride_status === 'completed') {
            return next(new ApiError(400, "Ride already completed"));
        }
        const ride = await sequelize.query(
            `UPDATE carpool_rides SET ride_status = 'completed' WHERE ride_id = ?`,
            {
                replacements: [ride_id],
                type: QueryTypes.UPDATE,
            }
        );
        if (ride) {
            return res.status(200).json(new ApiResponse(200, "Ride completed successfully", ride));
        } else {
            throw new ApiError(400, "Failed to complete ride");
        }
    } catch (error) {
        next(error)
    }
});

const delete_ride = asynchandler(async (req, res, next) => {
    try {
        const { ride_id } = req.params;
        if (!ride_id) {
            return next(new ApiError(400, "Please fill in all fields: ride id"));
        }
        const fetch_ride = await sequelize.query(
            `SELECT * FROM carpool_rides WHERE ride_id = ? `,
            { type: QueryTypes.SELECT, replacements: [ride_id] })

        if (!fetch_ride[0]) {
            return next(new ApiError(400, "Ride not found"));
        }
        if (fetch_ride[0].ride_status === 'completed') {
            return next(new ApiError(401, "Completed Ride cant be deleted"));
        }
        const route_id = await sequelize.query(`Delete from ride_routes where ride_id = ${ride_id}`, { type: QueryTypes.DELETE })
        if (!route_id) {
            return next(new ApiError(400, "Failed to delete ride route"));
        }

        const ride = await sequelize.query(
            `DELETE FROM carpool_rides WHERE ride_id = ?`,
            {
                replacements: [ride_id],
                type: QueryTypes.DELETE,
            }
        );
        if (ride) {

            return res.status(200).json(new ApiResponse(200, "Ride deleted successfully"));
        } else {
            throw new ApiError(400, "Failed to delete ride");
        }
    } catch (error) {
        next(error)
    }
});

// const update_ride = asynchandler(async (req, res, next) => {
//     try {
//         const { ride_id } = req.body;
//         if (!ride_id) {
//             return next(new ApiError(400, "Please fill in all fields"));
//         }
//         const fetch_ride = await sequelize.query(
//             `SELECT * FROM carpool_rides WHERE ride_id = ?`,
//             { type: QueryTypes.SELECT, replacements: [ride_id] })
//     } catch (error) {

//     }
// });


export { CreateRide, GetRides, complete_ride, delete_ride };