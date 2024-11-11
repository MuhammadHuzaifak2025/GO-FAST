import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ErrorHandling.js";
import app from '../app.js';
import { createServer } from "http";
import { Server } from "socket.io";  // Import the socket.io server
import { processRideRequest } from "../websockets/ride_request.js";

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
        } catch (error) {
            return next(new Error("Unauthorized - Invalid Access Token"));
        }

        const userExist = await User.findOne({ user_id: decoded.id });
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

    // Event for when a user requests a ride
    socket.on('request-ride-chat', (data) => {
        console.log('Ride request received:', data);

        // Process the ride request here
        const status = processRideRequest(data);

        status.then((response) => {
            console.log('Ride request processed:', response);
            // Notify the user of the request status
            socket.emit('ride-request-status', "Connecting the Chat Wait");

            // Notify the driver about the new ride request (assuming driverId is in response)
            if (response.driverId) {
                io.to(response.driverId).emit('new-ride-request', {
                    userId: data.user_id,
                    rideId: data.ride_id,
                });
            }
        }).catch((error) => {
            socket.emit('ride-request-status', { success: false, message: error.message });
        });
    });

    // Event for chat messages between the ride requester and driver
    socket.on('chat-message', (data) => {
        console.log('Chat message received:', data);

        // Save the chat message or handle any backend logic here
        const chatStatus = saveChatMessage(data.ride_id, data.senderId, data.receiverId, data.message);

        chatStatus.then((response) => {
            // Emit the chat message to the intended receiver
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
