import { Text, View, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { useLocalSearchParams } from 'expo-router';
import { getToken } from '../../../utils/expo-store';
import { v4 as uuidv4 } from 'uuid';

const ChatScreen = () => {

  const item = useLocalSearchParams(); // Optional params from the route

  const senderId = item.user_id; // Replace with dynamic ID if needed
  const senderName = item.username; // Replace with dynamic name if needed

  const { user } = useGlobalContext();

  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
                tempSocket.emit('reconnect', item.request_id);
            });

            tempSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            tempSocket.on('both-connected', () => {
                setIsLoading(true);
            })
        } catch (error) {
            console.error('Error connecting to socket:', error);
        }
    };

    const connectToChat = (tempSocket) => {
        if (tempSocket && item?.request_id) {
            tempSocket.emit('request-ride-chat', {
                request_id: item.request_id,
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
}, [item.request_id]); 

  const handleSend = useCallback(
    (newMessages = []) => {
      const message = newMessages[0];

      if (!socket) {
        console.warn('Socket not initialized');
        return;
      }

      // Emit the message to the server
      socket.emit('send-chat-message', {
        request_id: item.request_id,
        message: message.text,
        timestamp: new Date().toISOString(),
        senderId,
        senderName,
      });

      // Append the message to the local state
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );
    },
    [senderId, senderName, item.request_id] // Added item.request_id dependency
  );

  return (
    <SafeAreaView style={styles.container}>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.contrast} />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      ) : (
        <GiftedChat
        messages={messages}
        onSend={(messages) => handleSend(messages)}
        user={{
          _id: user.user_id,
          name: user.username,
        }}
        />
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#ffffff",
},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
},
loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
},
});

export default ChatScreen;
