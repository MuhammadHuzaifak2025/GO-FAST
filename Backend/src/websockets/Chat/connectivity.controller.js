import { Socket } from "socket.io";
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

const searchForPassenger = async (socket, request_id, passenger_id) => {
    try {
        const passengers = await sequelize.query(
            `SELECT * FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id 
             WHERE request_id = ? and b.driver =?`,
            {
                replacements: [request_id, socket.user.user_id],
                type: QueryTypes.SELECT,
            }
        );

        if (passengers.length > 0) {
            
            if (passengers[0].requesting_user_socket_id) {
                socket.reciever = passengers[0].requesting_user_socket_id;
                socket.to(socket.reciever).emit('ride-request-chat', {
                    message: 'Driver is ready to chat',
                });
                await socket.to(socket.reciever).emit('reconnect', { message: 'Reconnect to chat' });
            }
        }
    } catch (error) {
        console.error("Error in searchForPassenger:", error.message); // Log for debugging
        socket.emit('error', { message: error.message || 'Error processing ride request' });
    }
};

const search_for_driver = async (socket, request_id,) => {
    try {
        const driver = await sequelize.query(
            `SELECT * FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id 
             WHERE request_id = ? AND a.requesting_user = ?`,
            {
                replacements: [request_id, socket.user.user_id],
                type: QueryTypes.SELECT,
            }
        );
       
        if (driver[0]) {
            if (driver[0].owner_socket_id) {
                socket.reciever = driver[0].owner_socket_id;
                await socket.to(socket.reciever).emit('ride-request-chat', {
                    message: 'Passenger is ready to chat',
                });
                await socket.to(socket.reciever).emit('reconnect', { message: 'Reconnect to chat' });
            }
        }

    } catch (error) {
        console.error("Error in search_for_driver:", error.message); // Log for debugging
        socket.emit('error', {
            message: error.message || 'Error processing ride request',
        });
    }
}

const store_requesting_passenger = async (data) => {
    const [request_id, passenger_socket_id, request_user] = data;
    try {
        const request_user_details = await sequelize.query(
            `select * from ride_requests a inner join carpool_rides b on a.ride_id = b.ride_id  where request_id = ? and a.requesting_user = ?`,
            {
                replacements: [request_id, request_user],
                type: QueryTypes.SELECT,
            });
        if (request_user_details[0]) {

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
        console.error("Error in is_driver_is_requester:", error.message);
        throw new Error("Error processing ride request");
    }
}
const is_driver_is_requester = async (data) => {
    try {
        const [request_id, user_id] = data;
        if (!request_id || !user_id) {
            throw new Error("Invalid request data");
        }
        console.log("request_id", request_id);
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

        console.log("checkDriver", checkDriver);
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

const send_Message = async (data) => {
};

const remove_socket_id = async (socket, socket_id) => {
    try {
        const [Owner_ride_request] = await sequelize.query(
            `SELECT * FROM ride_requests WHERE owner_socket_id = ?`,
            {
                replacements: [socket_id],
                type: QueryTypes.SELECT,
            }
        );
        if (Owner_ride_request) {
            console.log("Owner Disconneted");
            socket.to(socket.reciever).emit('socket-disconnected', {
                message: "Owner is Disconneted",
                // timestamp: new Date(),
            })
        }
        const [Requesting_user_ride_request] = await sequelize.query(
            `SELECT * FROM ride_requests WHERE requesting_user_socket_id = ?`,
            {
                replacements: [socket_id],
                type: QueryTypes.SELECT,
            }
        );
        if (Requesting_user_ride_request) {
            console.log("Requesting User Disconneted");
            socket.to(socket.reciever).emit('socket-disconnected', {
                message: "Passenger is Disconneted",
            })
        }
    } catch (error) {
        console.error("Error in remove_socket_id:", error.message); // Log for debugging
        socket.emit('error', {
            message: error.message || 'Error processing ride request',
        });
    }
}

export { store_driver, remove_socket_id, search_for_driver, store_requesting_passenger, is_driver_is_requester, searchForPassenger };