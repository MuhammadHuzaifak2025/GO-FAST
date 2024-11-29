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
  const socketRef = useRef(null);

  useEffect(() => {
    const initializeSocket = async () => {
      if (socketRef.current) return;

      const token = await getToken('accessToken');
      socketRef.current = io(`${process.env.EXPO_PUBLIC_BACKEND_WS}`, {
        auth: { token },
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        socketRef.current.emit('request-ride-chat', {
          request_id: item.request_id,
        });
      });

      if (connected) {
        socketRef.current.on('reconnect', () => {
          socketRef.current.emit('request-ride-chat', {
            request_id: item.request_id,
          });
        });

        socketRef.current.on('receive-message', (data) => {
          const incomingMessage = {
            _id: uuidv4(),
            text: data.message,
            createdAt: new Date(data.timestamp),
            user: {
              _id: data.senderId,
              name: data.senderName,
            },
          };
          setMessages((prevMessages) =>
            GiftedChat.append(prevMessages, [incomingMessage])
          );
        });
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [item.request_id]); // Dependency array to rerun if request_id changes

  const handleSend = useCallback(
    (newMessages = []) => {
      const message = newMessages[0];

      if (!socketRef.current) {
        console.warn('Socket not initialized');
        return;
      }

      // Emit the message to the server
      socketRef.current.emit('send-chat-message', {
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
    <GiftedChat
      messages={messages}
      onSend={(messages) => handleSend(messages)}
      user={{
        _id: user.user_id,
        name: user.username,
      }}
    />
  );
};

export default ChatScreen;
