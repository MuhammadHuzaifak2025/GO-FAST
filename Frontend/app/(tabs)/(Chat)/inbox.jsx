import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { useLocalSearchParams } from 'expo-router';
import { getToken } from '../../../utils/expo-store';

const ChatScreen = () => {
  
  const item = useLocalSearchParams();


  const { user } = useGlobalContext();

  // const { roomId, userId, userName } = route.params; // Pass these as props
  const userId = user.user_id;
  const userName = user.username;
  const roomId = 1;
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {

    const socketInstance = io(`${process.env.EXPO_PUBLIC_BACKEND_WS}`, {auth: { token: async () => await getToken('accessToken') }}); // Replace with your server address
    setSocket(socketInstance);

    console.log(socketInstance);

    // Listen for incoming messages
    socketInstance.on('receiveMessage', (data) => {
      const incomingMessage = {
        _id: data.messageId,
        text: data.text,
        createdAt: new Date(data.createdAt),
        user: {
          _id: data.senderId,
          name: data.senderName,
        },
      };
      setMessages((prevMessages) => GiftedChat.append(prevMessages, incomingMessage));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleSend = useCallback(
    (newMessages = []) => {
      const message = newMessages[0];

      // Emit the message to the server
      socket.emit('sendMessage', {
        room: roomId,
        messageId: message._id,
        text: message.text,
        senderId: userId,
        senderName: userName,
        createdAt: message.createdAt,
      });

      setMessages((prevMessages) => GiftedChat.append(prevMessages, message));
    },
    [socket, roomId, userId, userName]
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
