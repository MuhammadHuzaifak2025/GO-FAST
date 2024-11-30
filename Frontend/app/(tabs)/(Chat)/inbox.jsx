import {
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import io from "socket.io-client";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { router, useLocalSearchParams } from "expo-router";
import { getToken } from "../../../utils/expo-store";
import { v4 as uuidv4 } from "uuid";
import { Ionicons } from "@expo/vector-icons";
const ChatScreen = () => {
  const item = useLocalSearchParams();

  const senderId = item.user_id;
  const senderName = item.username;
  const [isonline, setOnline] = useState(false);
  const { user } = useGlobalContext();

  const [messages, setMessages] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  const loading = useRef(false);
  const online = useRef(false);
  const [isloading, setIsLoading] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    const connectToSocket = async () => {
      try {
        const token = await getToken("accessToken");

        const tempSocket = io(`${process.env.EXPO_PUBLIC_BACKEND_WS}`, {
          auth: { token },
        });

        socketRef.current = tempSocket;

        tempSocket.on("connect", () => {
          console.log("Socket connected:", tempSocket.id);

          // Connect to chat room
          if (item?.request_id) {
            tempSocket.emit("request-ride-chat", {
              request_id: item.request_id,
            });
          }
        });

        tempSocket.on("reconnects", () => {
          tempSocket.emit("reconnect", { "request_id": item.request_id });
        });

        tempSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        tempSocket.on("ride-request-chat", () => {
          console.log("Ride request chat event received");
        })
        tempSocket.on("both-connected", () => {
          console.log("Both-connected event received");
          online.current = true;
        });

        tempSocket.on("all-messages", (messages) => {
          try {
            // Extract messages array from the response
            const newmessage = messages.messages;
            console.log("New Messages:", newmessage);
            // Validate that `newmessage` is an array
            if (!Array.isArray(newmessage)) {
              // console.error("Invalid messages format: Expected an array.", newmessage);
              setIsLoading(true);
              return;
            }

            // Format the messages according to GiftedChat requirements
            const formattedMessages = newmessage.map((message) => {
              // Ensure each message has the required fields
              if (
                typeof message.chat_message_id === "undefined" ||
                typeof message.message === "undefined" ||
                typeof message.timestamp === "undefined" ||
                typeof message.sender === "undefined"
              ) {
                console.warn("Skipping invalid message:", message);
                return null;
              }
              console.log("Message:", message.chat_message_id, message.message, message.timestamp, message.sender);
              return {
                _id: message.chat_message_id, // Use unique ID
                text: message.message, // Message content
                createdAt: new Date(message.timestamp), // Parse timestamp to Date
                user: {
                  _id: message.sender === user.user_id ? message.sender : null, // Sender's ID
                  name: `User ${message.sender === user.user_id ? message.sender : message.reciever}`, // Placeholder for sender's name
                },
              };
            }).filter((msg) => msg !== null); // Remove null entries (invalid messages)

            // Append new messages to the existing state
            setMessages(formattedMessages);

            console.log("Formatted Messages:", formattedMessages);
            setIsLoading(true);
          } catch (error) {
            console.error("Error processing messages:", error);
          }
        });



        tempSocket.on("socket-disconnected", (message) => {
          online.current = false;
        });

        tempSocket.on("receive-message", (message) => {
          setMessages((prevMessages) =>
            GiftedChat.append(prevMessages, [
              {
                _id: uuidv4(),
                text: message.message,
                createdAt: new Date(message.timestamp),
                user: {
                  _id: message.senderId,
                  name: message.senderName,
                },
              },
            ])
          );
        });
      } catch (error) {
        console.error("Error connecting to socket:", error.message);
      }
    };

    // Initialize socket connection
    connectToSocket();

    // Clean up function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
      }
    };
  }, [item.request_id]);

  useEffect(() => {
    setOnline(online.current);
  }, [online.current]);

  const handleSend = useCallback(
    (newMessages = []) => {
      const message = newMessages[0];

      if (!socketRef.current) {
        console.warn("Socket not initialized");
        return;
      }

      console.log("Sending message:", message.text);

      // Emit the message to the server
      socketRef.current.emit("send-chat-message", {
        request_id: item.request_id,
        reciever: item?.user_id,
        message: message.text,
        timestamp: new Date().toISOString(),
        senderId,
        senderName,
        online: online.current,
      });

      // Append the message to the local state
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );
    },
    [senderId, senderName, item.request_id]
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/chat-list")}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={28}

          />
        </TouchableOpacity>
      </View>

      {!isloading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Waiting For Other Partner to Connect</Text>
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
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    // backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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
