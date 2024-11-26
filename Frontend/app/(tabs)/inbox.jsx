import React, { useEffect, useState, useCallback } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';
import { useGlobalContext } from '../../context/GlobalProvider';

const ChatScreen = ({ route }) => {
  
  const { user } = useGlobalContext();

  // const { roomId, userId, userName } = route.params; // Pass these as props
  const userId = user.user_id;
  const userName = user.username;
  const roomId = 1;
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://<your-server-ip>:5000'); // Replace with your server address
    setSocket(socketInstance);

    // Join the chat room
    socketInstance.emit('joinRoom', roomId);

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
  }, [roomId]);

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
        _id: userId,
        name: userName,
      }}
    />
  );
};

export default ChatScreen;
