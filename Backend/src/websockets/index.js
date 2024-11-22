import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ErrorHandling.js";
import app from '../app.js';
import { createServer } from "http";
import { Server } from "socket.io";  // Import the socket.io server
// import { processRideRequest } from "../websockets/ride_request.js";
import { is_driver_is_requester, store_driver, store_requesting_passenger } from "./Chat/connectivity.controller.js";

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
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("token", decoded);
        } catch (error) {
            return next(new Error("Unauthorized - Invalid Access Token"));
        }

        const userExist = await User.findOne({ user_id: decoded.id });
        // console.log(userExist);
        if (!userExist) {
            return next(new Error("Unauthorized - User Does Not Exist"));
        }

        socket.user = userExist;
        next();
    } catch (error) {
        next(new Error("Authentication Error"));
    }
});

io.on('connection', (socket) => {


    socket.on('request-ride-chat', async (data) => {
        let user;
        console.log(socket.user.user_id);
        console.log("Request ride chat initiated");

        try {
            const response = await is_driver_is_requester([data.request_id, socket.user.user_id]);
            console.log(response);

            if (response === "driver") {
                await store_driver([socket.user.user_id, data.request_id, socket.id]);
                user = "driver";
                console.log("Driver is the requester");
            } else if (response === "passenger") {
                await store_requesting_passenger([data.request_id, socket.id, socket.user.user_id]);
                console.log("Passenger is the requester");
                user = "passenger";
            }

            socket.emit('ride-request-chat', { message: 'Ride request chat initiated', user });
        } catch (error) {
            console.error(error.message); // Log error for debugging
            socket.emit('error', { message: error.message || 'Error processing ride request' });
        }
    });


    // Event for chat messages between the ride requester and driver
    socket.on('send-chat-message', (data) => {
        const chatStatus = saveChatMessage(data.ride_id, data.senderId, data.receiverId, data.message);

        chatStatus.then((response) => {
            io.to(data.receiverId).emit('receive-message', {
                rideId: data.ride_id,
                senderId: data.senderId,
                message: data.message,
                timestamp: new Date(),
            });
        }).catch((error) => {
            socket.emit('chat-error', { message: 'Failed to send message', error: error.message });
        });
    });

    // Error handling
    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('WebSocket disconnected:', socket.id);
    });
});
export default server;
