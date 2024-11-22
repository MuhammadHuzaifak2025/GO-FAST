import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ErrorHandling.js";
import app from '../app.js';
import { createServer } from "http";
import { Server } from "socket.io";  // Import the socket.io server
// import { processRideRequest } from "../websockets/ride_request.js";
import { is_driver_is_requester, searchForPassenger, store_driver, store_requesting_passenger } from "./Chat/connectivity.controller.js";

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
        console.log("Decoded token:", decoded);
        const userExist = await User.findOne({ where: { user_id: decoded.user_id } });

        if (!userExist) {
            return next(new Error("Unauthorized - User Does Not Exist"));
        }
        console.log("User authenticated:", userExist);
        socket.user = userExist;
        socket.join(socket.id);
        next();
    } catch (error) {
        next(new Error("Authentication Error"));
    }
});

io.on('connection', (socket) => {
    console.log("User connected:", socket.user.user_id);

    socket.on('request-ride-chat', async (data) => {
        let userType;
        try {
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

            io.to(socket.id).emit('ride-request-chat', {
                message: 'Ride request chat initiated',
                user: userType,
            });
            if (userType === "driver") {
                await searchForPassenger(socket, data.request_id);
            }
            if (userType === "passenger") {
                await searchForDriver(socket, data.request_id);
            }
        } catch (error) {
            console.error(error.message);
            socket.emit('error', { message: error.message || 'Error processing ride request' });
        }
    });

    socket.on('send-chat-message', async (data) => {
        try {
            await saveChatMessage(data.ride_id, data.senderId, data.receiverId, data.message);

            // Emit message to the receiver's room
            io.to(data.receiverId).emit('receive-message', {
                rideId: data.ride_id,
                senderId: data.senderId,
                message: data.message,
                timestamp: new Date(),
            });
        } catch (error) {
            socket.emit('chat-error', { message: 'Failed to send message', error: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

export default server;
