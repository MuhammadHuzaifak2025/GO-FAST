import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ErrorHandling.js";
import app from '../app.js';
import { createServer } from "http";
import { Server } from "socket.io";  // Import the socket.io server
// import { processRideRequest } from "../websockets/ride_request.js";
import { fetchall_messages, is_driver_is_requester, processRideRequest, remove_socket_id, save_message, search_for_driver, searchForPassenger, store_driver, store_requesting_passenger } from "./Chat/connectivity.controller.js";

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",  // Allow all origins temporarily for testing
        methods: ["GET", "POST"],
        credentials: true,
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers['access-token'];

        if (!token) {
            return next(new Error("Unauthorized - No Token Provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded token:", decoded);
        const userExist = await User.findOne({ where: { user_id: decoded.user_id } });

        if (!userExist) {
            return next(new Error("Unauthorized - User Does Not Exist"));
        }
        // console.log("User authenticated:", userExist);
        socket.user = userExist;
        socket.join(socket.id);
        next();
    } catch (error) {
        next(new Error("Authentication Error"));
    }
});
io.on('connection', (socket) => {
    // console.log("User connected:", socket.user.user_id);

    socket.on('request-ride-chat', async (data) => {
        let userType;
        try {
            const createchatifnot = await processRideRequest(data.request_id, socket);
            const response = await is_driver_is_requester([data.request_id, socket.user.user_id]);

            if (response === "driver") {
                await store_driver([socket.user.user_id, data.request_id, socket.id]);
                userType = "driver";
                console.log("Driver is the requester");
            } else if (response === "passenger") {
                await store_requesting_passenger([data.request_id, socket.id, socket.user.user_id]);
                userType = "passenger";
                console.log("Passenger is the requester");
            }
            else {
                return socket.emit('error', { message: response.error || 'Error processing ride request' });
            }
            const resp = await fetchall_messages(socket);
            io.to(socket.id).emit('all-messages', { messages: resp });
            if (userType === "driver") {
                console.log("Driver", socket.id);
                await searchForPassenger(socket, data.request_id);

                if (socket.reciever) {

                    await io.to(socket.reciever).emit('reconnects', { message: 'Reconnect to chat' });
                }
                else {
                    return socket.emit('error', { message: 'No passenger found' });
                }
            }
            if (userType === "passenger") {
                console.log("Passenger", socket.id);
                await search_for_driver(socket, data.request_id);

                if (socket.reciever) {
                    await io.to(socket.reciever).emit('reconnects', { message: 'Reconnect to chat' });
                }
                else {
                    return socket.emit('error', { message: 'No passenger found' });
                }
            }

        } catch (error) {
            console.error(error.message);
            socket.emit('error', { message: error.message || 'Error processing ride request' });
        }
    });

    socket.on('reconnect', async (data) => {
        console.log("Reconnect", data);
        const response = await is_driver_is_requester([data.request_id, socket.user.user_id]);
        console.log(response);
        if (response === "driver") {
            const resp = await searchForPassenger(socket, data.request_id);
            if (!resp)
                await io.to(socket.reciever).emit('reconnect', { message: 'Reconnect to chat' });
        }
        if (response === "passenger") {
            const resp = await search_for_driver(socket, data.request_id);
            if (!resp)
                await io.to(socket.reciever).emit('reconnect', { message: 'Reconnect to chat' });
        }
        // io.to.emit({ message: 'Both users connected' });
        io.emit('both-connected', { message: 'Both users are connected' });
        io.to(socket.reciever).emit('both-connected', { message: 'Both users connected' });
        console.log(socket.id, socket.reciever, "");
    }
    );


    socket.on('send-chat-message', async (data) => {
        try {
            console.log("Send chat message", data);
            if (data.online === true) {
                console.log("Hello")
                if (socket.reciever === undefined) {
                    return socket.emit('chat-error', { message: 'Recipient not online' });
                }
                await socket.to(socket.reciever).emit('receive-message', {
                    message: data.message,
                    timestamp: new Date(),
                });
                save_message(data, socket);
            }
            else {
                save_message(data, socket);
            }
        } catch (error) {
            socket.emit('chat-error', { message: 'Failed to send message', error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        remove_socket_id(socket, socket.id);
    });
});

export default server;
