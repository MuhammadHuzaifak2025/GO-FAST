import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { useLocalSearchParams } from 'expo-router';
import { getToken } from '../../../utils/expo-store';
import { v4 as uuidv4 } from 'uuid';

const ChatScreen = () => {

  const item = useLocalSearchParams(); // Optional params from the route
  // console.log("1",item);

  const senderId = item.user_id; // Replace with dynamic ID if needed
  const senderName = item.username; // Replace with dynamic name if needed

  const { user } = useGlobalContext();

  const [messages, setMessages] = useState([]);
  
  const [isInit, setisInit] = useState(false);
  
  const socketRef = useRef(null);

  useEffect(() => {
      const initializeSocket = async () => {
          if (socketRef.current) return; // Skip reinitialization
  
          const token = await getToken('accessToken');
          socketRef.current = io(`${process.env.EXPO_PUBLIC_BACKEND_WS}`, { auth: { token } });
  
          socketRef.current.on('reconnect', () => {
              console.log('Reconnected to server');
              if (!isInit) {
                  socketRef.current.emit('request-ride-chat', { request_id: item.request_id });
              }
          });
  
          socketRef.current.on('receive-message', (data) => {
              const incomingMessage = {
                  _id: uuidv4(),
                  text: data.message,
                  createdAt: new Date(data.timestamp),
                  user: {
                      _id: senderId,
                      name: senderName,
                  },
              };
              setMessages((prevMessages) => GiftedChat.append(prevMessages, incomingMessage));
          });
  
          if (!isInit) {
              setisInit(true);
              socketRef.current.emit('request-ride-chat', { request_id: item.request_id });
          }
      };
  
      initializeSocket();
  
      return () => {
          if (socketRef.current) {
              socketRef.current.disconnect();
          }
      };
  }, [isInit]);


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
      setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    },
    [socketRef, senderId, senderName]
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
