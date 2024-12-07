import { Socket } from "socket.io";
import sequelize from "../../database/index.js";
import { QueryTypes } from "sequelize";

const processRideRequest = async (request_id, socket) => {
    try {
        const chat = await sequelize.query(
            `select * from "Chats" where request_id = ?`,
            {
                replacements: [request_id],
                type: QueryTypes.SELECT,
            });
        if (!chat[0]) {
            const [insertChat] = await sequelize.query(
                `INSERT INTO "Chats" (request_id, timestamp, "createdAt", "updatedAt") VALUES (?, ?,?,?) returning chat_id`,
                {
                    replacements: [request_id, new Date(), new Date(), new Date()],
                    type: QueryTypes.INSERT,
                });
            console.log(insertChat[0]);
            socket.chat = insertChat[0].chat_id;
            return insertChat;

        }
        socket.chat = chat[0].chat_id;
        return chat[0];
    } catch (error) {
        console.error("Error in processRideRequest:", error.message); // Log for debugging
        throw new Error("Error processing ride request");
    }
}

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
        // socket.emit('error', {
        //     message: error.message || 'Error processing ride request',
        // });
        throw new Error("Error processing ride requestasdas");
    }
};

const searchForPassenger = async (socket, request_id, passenger_id) => {
    try {
        const [passengers] = await sequelize.query(
            `SELECT * FROM ride_requests a 
             INNER JOIN carpool_rides b ON a.ride_id = b.ride_id 
             WHERE request_id = ? and b.driver =?`,
            {
                replacements: [request_id, socket.user.user_id],
                type: QueryTypes.SELECT,
            }
        );
        console.log("Passenger", passengers);
        if (passengers) {

            if (passengers.requesting_user_socket_id) {
                socket.reciever = passengers.requesting_user_socket_id;
                // socket.to(socket.reciever).emit('ride-request-chat', {
                //     message: 'Driver is ready to chat',
                // });
                // await socket.to(socket.reciever).emit('reconnect', { message: 'Reconnect to chat' });
            }
            console.log("Passenger", passengers.requesting_user);
            socket.receiver_user_id = passengers.requesting_user;
        }
    } catch (error) {
        socket.emit('error', {
            message: error.message || 'Error processing ride request',
        });
        console.error("Error in searchForPassenger:", error.message); // Log for debugging
        socket.emit('error', { message: error.message || 'Error processing ride request' });
    }
};

const check_if_both_connected = async (socket, request_id) => {
    try {
        // Check if the driver (owner) is connected
        const [Owner_ride_request] = await sequelize.query(
            `SELECT * FROM ride_requests WHERE request_id = ? AND owner_socket_id IS NOT NULL`,
            {
                replacements: [request_id],
                type: QueryTypes.SELECT,
            }
        );

        // Check if the requesting user (passenger) is connected
        const [Requesting_user_ride_request] = await sequelize.query(
            `SELECT * FROM ride_requests WHERE request_id = ? AND requesting_user_socket_id IS NOT NULL`,
            {
                replacements: [request_id],
                type: QueryTypes.SELECT,
            }
        );

        // Emit messages if both are connected
        if (Owner_ride_request) {
            socket.to(Owner_ride_request.owner_socket_id).emit('socket-connected', {
                message: "Owner (Driver) is Connected",
            });
        }

        if (Requesting_user_ride_request) {
            socket.to(Requesting_user_ride_request.requesting_user_socket_id).emit('socket-connected', {
                message: "Passenger is Connected",
            });
        }

        // Emit message if both are connected at the same time
        if (Owner_ride_request && Requesting_user_ride_request) {
            socket.to(Owner_ride_request.owner_socket_id).emit('both-connected', {
                message: "Both Driver and Passenger are Connected",
            });
            socket.to(Requesting_user_ride_request.requesting_user_socket_id).emit('both-connected', {
                message: "Both Driver and Passenger are Connected",
            });
        }
    } catch (error) {
        console.error("Error in check_if_both_connected:", error.message); // Log for debugging
        socket.emit('error', {
            message: error.message || 'Error processing ride request',
        });
    }
};


const search_for_driver = async (socket, request_id,) => {
    try {
        console.log("kjashdkjashdaksj")
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

                // await socket.to(socket.reciever).emit('ride-request-chat', {
                //     message: 'Passenger is ready to chat',
                // });
                // await socket.to(socket.reciever).emit('reconnect', { message: 'Reconnect to chat' });
            }
            console.log("Driversss", driver[0].driver);
            socket.receiver_user_id = driver[0].driver;
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
        // socket.emit('error', {
        //     message: error.message || 'Error processing ride request',
        // });
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
        return error;
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

const save_message = async (data, socket) => {
    try {
        const { request_id, message, timestamp, senderId, receiver, senderName } = data;
        const message_data = {
            request_id,
            message,
            timestamp,
            receiver,
            senderId,
            senderName,
        };
        if (!data.receiver) {
            data.receiver = socket.receiver_user_id;
        }
        console.log(data.receiver_user_id)
        await sequelize.query(
            `INSERT INTO "ChatMessages" (chat_id, sender, receiver, message, timestamp, is_read, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [socket.chat, socket.user.user_id, data.reciever ? data.receiver : socket.receiver_user_id, message_data.message, message_data.timestamp, false, new Date(), new Date()],
                type: QueryTypes.INSERT,
            }
        );
    } catch (error) {
        console.error("Error in save_message:", error.message); // Log for debugging
        socket.emit('error', {
            message: error.message || 'Error processing ride request',
        });
    }
}

const fetchall_messages = async (socket) => {
    try {
        console.log(socket.chat);
        const messages = await sequelize.query(
            `SELECT * FROM "ChatMessages" WHERE chat_id = ? order by timestamp`,
            {
                replacements: [socket.chat],
                type: QueryTypes.SELECT,
            }
        );
        // socket.to(socket.id).emit('all-messages', { messages });
        console.log(messages);
        return messages.reverse();
    } catch (error) {
        socket.emit('error', {
            message: error.message || 'Error processing ride request',
        });
        console.error("Error in fetchall_messages:", error.message); // Log for debugging
    }
}

export { store_driver, save_message, fetchall_messages, remove_socket_id, processRideRequest, search_for_driver, store_requesting_passenger, is_driver_is_requester, searchForPassenger };