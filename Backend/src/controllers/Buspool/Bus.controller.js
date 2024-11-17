import sequelize from "../../database/index.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import { QueryTypes } from "sequelize";

const create_bus = asynchandler(async (req, res, next) => {
    try {
        if (!req.user.admin) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        const { bus_number, seats, single_ride_fair } = req.body;
        const [bus_organization] = await sequelize.query(`
            SELECT organization_id FROM transport_organizations 
            WHERE owner = ${req.user.user_id}`, { type: QueryTypes.SELECT });
        if (!bus_organization) {
            throw new ApiError(404, "Organization not found");
        }
        const [getifbus] = await sequelize.query(`
            SELECT bus_id FROM buses
            WHERE bus_number = '${bus_number}'`, { type: QueryTypes.SELECT });

        if (getifbus) {
            throw new ApiError(409, [
                "Bus already exists with details: ",
                JSON.stringify(getifbus, null, 2) // Pretty-print JSON for readability
            ]);
        }

        const [bus] = await sequelize.query(`
            INSERT INTO buses (bus_number, seats, bus_organization, single_ride_fair, "createdAt", "updatedAt")
            VALUES (:bus_number, :seats, :bus_organization, :single_ride_fair, :createdAt, :updatedAt) RETURNING *`,
            {
                replacements: {
                    bus_number,
                    seats,
                    bus_organization: bus_organization.organization_id,
                    single_ride_fair,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                type: QueryTypes.INSERT,
            }
        );
        return res.status(201).json(new ApiResponse(201, "Bus created successfully", bus));
    } catch (error) {
        next(error);;
    }
});


const get_all_buses = asynchandler(async (req, res, next) => {
    try {
        const [buses] = await sequelize.query(`
            SELECT * FROM bus`, { type: QueryTypes.SELECT });

        if (!buses) {
            throw new ApiError(404, "No buses found");
        }
        return res.status(200).json(new ApiResponse(200, "Buses fetched successfully", buses));
    } catch (error) {
        next(error);
    }
}
);

const add_routes_to_bus = asynchandler(async (req, res, next) => {
    try {
        if (!req.user.admin) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        const { route, bus_id } = req.body;

        // Validate input
        if (!route || !bus_id) {
            throw new ApiError(400, "Please provide all required fields");
        }

        // Check if the bus exists
        const [bus] = await sequelize.query(
            `SELECT bus_id FROM buses WHERE bus_id = ?`,
            { replacements: [bus_id], type: QueryTypes.SELECT }
        );
        if (!bus) {
            throw new ApiError(404, "Bus not found");
        }
        let i = 0;

        const busroutes = [];
        for (const routes of route) {
            // Validate route fields
            if (!routes.route_name) {
                throw new ApiError(400, "Please fill in all fields for each route");
            }

            let route_id;

            // Check if the route exists
            const [existingRoute] = await sequelize.query(
                `SELECT route_id FROM routes WHERE route_name = ? AND longitude = ? AND latitude = ?`,
                {
                    replacements: [routes.route_name, routes.longitude, routes.latitude],
                    type: QueryTypes.SELECT,
                }
            );

            if (existingRoute) {
                route_id = existingRoute.route_id;
            } else {
                // Create a new route if it does not exist
                const [newRoute] = await sequelize.query(
                    `INSERT INTO routes ("route_name", "longitude", "latitude", "createdAt", "updatedAt")
                     VALUES (?, ?, ?, ?, ?) RETURNING route_id`,
                    {
                        replacements: [routes.route_name, routes.longitude, routes.latitude, new Date(), new Date()],
                        type: QueryTypes.INSERT,
                    }
                );
                console.log(newRoute);
                if (newRoute) {
                    route_id = newRoute[0].route_id;
                } else {
                    throw new ApiError(400, "Failed to create route");
                }
            }

            // Link the route to the bus
            const [routeBus] = await sequelize.query(
                `INSERT INTO busroutes (bus_id, route_id, "createdAt", "updatedAt", "order")
                 VALUES (?, ?, ?, ?, ?) RETURNING *`,
                {
                    replacements: [bus_id, route_id, new Date(), new Date(), i++],
                    type: QueryTypes.INSERT,
                }
            );

            busroutes.push(routeBus); // Push the created route-bus relationship
        }

        // Respond with success
        return res.status(201).json(
            new ApiResponse(201, ["Route added to bus successfully", busroutes])
        );
    } catch (error) {
        next(error);
    }
});


const getbusroutes = asynchandler(async (req, res, next) => {
    try {
        const { bus_id } = req.params;
        const [getbusroutes] = await sequelize.query(`
            SELECT * FROM bus_routes inner join buses on bus_routes.bus_id = buses.bus_id
            WHERE bus_id = ${bus_id}`, { type: QueryTypes.SELECT });
        if (!getbusroutes) {
            throw new ApiError(404, "No routes found for this bus");
        }
        else {
            return res.status(200).json(new ApiResponse(200, "Routes fetched successfully", getbusroutes));
        }
    } catch (error) {

    }
});

const get_all_buses_with_routes = asynchandler(async (req, res, next) => {
    try {
        const { transport_organizer } = req.params;

        let buses;
        if (transport_organizer) {
            console.log("Jkhvh")
            buses = await sequelize.query(`
            SELECT * FROM buses a inner join Transport_Organizations b on a.bus_organization = b.organization_id where b.owner = ${transport_organizer} `, { type: QueryTypes.SELECT });
        }
        else {
            buses = await sequelize.query(`
                SELECT * FROM buses `, { type: QueryTypes.SELECT });
        }
        if (!buses) {
            throw new ApiError(404, "No buses found");
        }

        const bus_routes = [];
        for (const bus of buses) {
            const routes = await sequelize.query(`
                SELECT route_name, longitude, latitude FROM busroutes a
                INNER JOIN routes ON a.route_id = routes.route_id
                WHERE a.bus_id = ${bus.bus_id} order by a.order asc`, { type: QueryTypes.SELECT });
            bus_routes.push({ bus, routes });
        }
        return res.status(200).json(new ApiResponse(200, "Buses fetched successfully", bus_routes));
    } catch (error) {
        next(error);
    }
});
export {
    getbusroutes,
    create_bus,
    add_routes_to_bus,
    get_all_buses,
    get_all_buses_with_routes
};