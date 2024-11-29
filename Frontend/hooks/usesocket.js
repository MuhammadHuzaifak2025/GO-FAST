import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (data) => {
    const [socket, setSocket] = useState(null);

    // Function to retrieve the token (mock implementation, replace with actual logic)
    const getToken = async (key) => {
        // Replace this with your token retrieval logic
        return "yourAccessToken";
    };

    useEffect(() => {
        const connectToSocket = async () => {
            try {
                const token = await getToken('accessToken');

                // Connect to the WebSocket server
                const tempSocket = io(`${process.env.EXPO_PUBLIC_BACKEND_WS}`, {
                    auth: { token },
                    transports: ['websocket'],
                });

                // Set the socket instance in state
                setSocket(tempSocket);

                // Handle connection events
                tempSocket.on('connect', () => {
                    console.log('Socket connected:', tempSocket.id);
                    connectToChat(tempSocket);
                });

                tempSocket.on('reconnect', () => {
                    console.log('Socket reconnected');
                    connectToChat(tempSocket);
                });

                tempSocket.on('connect_error', (error) => {
                    console.error('Socket connection error:', error);
                });
            } catch (error) {
                console.error('Error connecting to socket:', error);
            }
        };

        const connectToChat = (tempSocket) => {
            if (tempSocket && data?.request_id) {
                tempSocket.emit('request-ride-chat', {
                    request_id: data.request_id,
                });
            }
        };

        // Initialize socket connection
        connectToSocket();
        connectToChat(socket);

        // Clean up function to disconnect the socket on unmount
        return () => {
            if (socket) {
                socket.disconnect();
                console.log('Socket disconnected');
            }
        };
    }, [data.request_id]); // Re-run if request_id changes

    return socket;
};

export default useSocket;
