import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import ApiError from "../utils/ErrorHandling.js";
import app from '../app.js';
import { createServer } from "http";
import { Server } from "socket.io";  // Import the socket.io server


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
        // Retrieve the token from socket's `auth` object (sent by the client)
        const token = socket.handshake.auth.token || socket.handshake.headers['access-token'];

        if (!token) {
            return next(new Error("Unauthorized - No Token Provided"));
        }

        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return next(new Error("Unauthorized - Invalid Access Token"));
        }

        // Find the user by the decoded ID
        const userExist = await User.findById(decoded.id);
        if (!userExist) {
            return next(new Error("Unauthorized - User Does Not Exist"));
        }

        // Attach the user to the socket instance
        socket.user = userExist;
        next();  // Proceed to the next middleware or connection handler
    } catch (error) {
        next(new Error("Authentication Error"));
    }
});

io.on('connection', (socket) => {
    // console.log('New WebSocket connection:', socket.id);
    // console.log('Authenticated user:', socket.user);  // Access the authenticated user

    // Example: Handle custom events
    socket.on('update-canvas', (data) => {
        console.log('Message received:', data);
        const status = save_canvas(data.poster_id, data.design);
        status.then((response) => {
            // console.log('Response:', response);
            socket.emit('canvas-status', response);
        })
            .catch((error) => {
                // console.log('Error:', error);
                socket.emit('canvas-status', error);
            });
    });

    socket.on('error', (error) => {
        // console.log('WebSocket error:', error);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        // console.log('WebSocket disconnected:', socket.id);
    });
});

export default server;
