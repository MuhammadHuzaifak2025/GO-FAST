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
        if (!vehicle) {
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
            `INSERT INTO carpool_rides (vehicle_id, start_time, fare, seat_available, driver, "createdAt", "updatedAt") VALUES (?,?,?,?,?,?,?)
            RETURNING ride_id`,
            {
                replacements: [vehicle_id, start_time, price, seats, user_id, new Date(), new Date()],
                type: QueryTypes.INSERT,
            }
        );
        const newRideId = ride[0][0].ride_id;
        console.log(newRideId);
        if (ride) {
            for (const routes of route) {
                const ride_route = await sequelize.query(
                    `INSERT INTO ride_routes (ride_id, route_id,  "createdAt", "updatedAt") VALUES (?,?,?,? )`,
                    {
                        replacements: [newRideId, routes.route_id, new Date(), new Date()],
                        type: QueryTypes.INSERT,
                    }
                );
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
            ride_details[0].vehicle = vehicle[0];
            return res.status(201).json(new ApiResponse(201, "Ride created successfully", ride_details[0]));
        } else {
            throw new ApiError(400, "Failed to create ride");
        }
    } catch (error) {
        next(error);

    }
});

export { CreateRide };