import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const store_driver = async (data) => {
    const [driver_id, request_id, driver_socket_it] = data;
    try {
        const driver = await sequelize.query(
            `select * from ride_requests a inner join carpool_rides b on a.ride_id = b.ride_id  where request_id = ? and b.driver = ?`,
            {
                replacements: [request_id, driver_id],
                type: QueryTypes.SELECT,
            });
        console.log(driver)
        if (driver[0]) {
            await sequelize.query(
                `update ride_requests set owner_socket_id = ? where request_id = ?`,
                {
                    replacements: [driver_socket_it, request_id],
                    type: QueryTypes.UPDATE,
                });
            return "Driver Socket Id stored successfully";
        }
        else {
            throw new Error("Driver not found");
        }
    } catch (error) {
        throw new Error("Error processing ride requestasdas");
    }
};

const store_requesting_passenger = async (data) => {
    const { request_id, passenger_socket_id, request_user } = data;
    try {
        const request_user = await sequelize.query(
            `select * from ride_requests a inner join rides b on a.ride_id = b.ride_id  where request_id = ? and b.requesting_user = ?`,
            {
                replacements: [request_id, request_user],
                type: QueryTypes.SELECT,
            });
        if (request_user[0]) {

            await sequelize.query(
                `update ride_requests set requesting_user_socket_id = ? where request_id = ?`,
                {
                    replacements: [passenger_socket_id, request_id],
                    type: QueryTypes.UPDATE,
                });
            return "Passenger Socket Id stored successfully";
        }
        else {
            throw new Error("Passenger not found");
        }
    } catch (error) {
        throw new Error("Error processing ride request");
    }
}
const is_driver_is_requester = async (data) => {
    try {
        const [request_id, user_id] = data;
        if (!request_id || !user_id) {
            throw new Error("Invalid request data");
        }

        // Check if the user is the driver
        const checkDriver = await sequelize.query(
            `SELECT * FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id 
             WHERE request_id = ? AND b.driver = ?`,
            {
                replacements: [request_id, user_id],
                type: QueryTypes.SELECT,
            }
        );

        if (checkDriver.length > 0) {
            return "driver";
        }

        // Check if the user is the requesting passenger
        const checkPassenger = await sequelize.query(
            `SELECT * FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id 
             WHERE request_id = ? AND a.requesting_user = ?`,
            {
                replacements: [request_id, user_id],
                type: QueryTypes.SELECT,
            }
        );

        if (checkPassenger.length > 0) {
            return "passenger";
        }

        throw new Error("User not found for the given request");
    } catch (error) {
        console.error("Error in is_driver_is_requester:", error.message); // Log for debugging
        throw new Error(error.message || "Error processing ride request");
    }
};



export { store_driver, store_requesting_passenger, is_driver_is_requester };