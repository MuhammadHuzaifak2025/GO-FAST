import carpool_vehicle from "../../models/carpool/carpool_vehicle.models.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const createVehicle = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const { type_of_vehicle, seats, registration_number, model, make, color } = req.body;
        if (!type_of_vehicle || !seats || !registration_number || !model || !make || !color) {
            return next(new ApiError(402, "Please fill in all fields"));
        }
        if (type_of_vehicle !== "Car" && type_of_vehicle !== "Bike") {
            return next(new ApiError(403, "Invalid type of vehicle: Car or Bike is valid"));
        }
        if (seats < 1) {
            return next(new ApiError(403, "Number of seats must be greater than 0"));
        }

        const vehicle = await sequelize.query(
            `SELECT * 
            FROM carpool_vehicles
            WHERE owner = ${user_id}
            AND type_of_vehicle = '${type_of_vehicle}'
            AND registration_number = '${registration_number}'
            LIMIT 1;`,
            { type: QueryTypes.SELECT }
        );

        if (vehicle[0])
            return next(new ApiError(400, "Vehicle already exists"));
        else {
            const create_vehicle = await sequelize.query(`
                INSERT INTO carpool_vehicles (owner, type_of_vehicle, seats, registration_number, model, make, color, "createdAt", "updatedAt")
                VALUES (${user_id}, '${type_of_vehicle}', ${seats}, '${registration_number}', '${model}', '${make}', '${color}', NOW(), NOW())`,
                { type: QueryTypes.INSERT }
            );

            if (create_vehicle) {
                const get_vehicle = await sequelize.query(
                    `SELECT * 
                    FROM carpool_vehicles
                    WHERE owner = ${user_id}
                    AND type_of_vehicle = '${type_of_vehicle}'
                    AND registration_number = '${registration_number}'
                    LIMIT 1;`,
                    { type: QueryTypes.SELECT }
                );
                return res.status(200).json(new ApiResponse(200, ["Vehicle Created Successfully", get_vehicle[0]]));
            }
            else
                return next(new ApiError(400, "Failed to create vehicle"));
        }
    } catch (error) {
        next(error);
    }
});


const getVehicles = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const vehicles = await sequelize.query(
            `SELECT * 
            FROM carpool_vehicles
            WHERE owner = ${user_id};`,
            { type: QueryTypes.SELECT }
        );
        return res.status(200).json(new ApiResponse(200, ["Vehicles fetched successfully", vehicles]));
    } catch (error) {
        next(error);
    }
});

const getvehicle = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const vehicle_id = req.params.vehicle_id;
        const vehicle = await sequelize.query(
            `SELECT * 
            FROM carpool_vehicles
            WHERE owner = ${user_id}
            AND vehicle_id = ${vehicle_id}
            LIMIT 1;`,
            { type: QueryTypes.SELECT }
        );
        if (vehicle[0])
            return res.status(200).json(new ApiResponse(200, ["Vehicle fetched successfully", vehicle[0]]));
        else
            return next(new ApiError(404, "Vehicle not found"));
    } catch (error) {
        next(error);
    }
});

const updateVehicle = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const vehicle_id = req.params.vehicle_id;
        const { type_of_vehicle, seats, registration_number, model, make, color } = req.body;
        if (!type_of_vehicle || !seats || !registration_number || !model || !make || !color) {
            return next(new ApiError("Please fill in all fields", 400));
        }
        if (type_of_vehicle !== "Car" && type_of_vehicle !== "Bike") {
            return next(new ApiError("Invalid type of vehicle: Car or Bike is valid", 400));
        }
        if (seats < 1) {
            return next(new ApiError("Number of seats must be greater than 0", 400));
        }

        const vehicle = await sequelize.query(
            `SELECT * 
            FROM carpool_vehicles
            WHERE owner = ${user_id}
            AND vehicle_id = ${vehicle_id}
            LIMIT 1;`,
            { type: QueryTypes.SELECT }
        );

        if (!vehicle[0])
            return next(new ApiError(404, "Vehicle not found"));
        else {
            const update_vehicle = await sequelize.query(`
                UPDATE carpool_vehicles
                SET type_of_vehicle = '${type_of_vehicle}', seats = ${seats}, registration_number = '${registration_number}', model = '${model}', make = '${make}', color = '${color}', "updatedAt" = NOW()
                WHERE owner = ${user_id}
                AND vehicle_id = ${vehicle_id};`,
                { type: QueryTypes.UPDATE }
            );

            if (update_vehicle) {
                const get_vehicle = await sequelize.query(
                    `SELECT * 
                    FROM carpool_vehicles
                    WHERE owner = ${user_id}
                    AND vehicle_id = ${vehicle_id}
                    LIMIT 1;`,
                    { type: QueryTypes.SELECT }
                );
                return res.status(200).json(new ApiResponse(200, ["Vehicle Updated Successfully", get_vehicle[0]]));
            }
            else
                return next(new ApiError(400, "Failed to update vehicle"));
        }
    } catch (error) {
        next(error);
    }

});

// const delete_vehicle = asynchandler(async (req, res, next) => { 
//     const {vehicle_id }
// });

export { createVehicle, getVehicles, getvehicle, updateVehicle };