import {
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import io from "socket.io-client";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { useLocalSearchParams } from "expo-router";
import { getToken } from "../../../utils/expo-store";
import { v4 as uuidv4 } from "uuid";

const ChatScreen = () => {
  const item = useLocalSearchParams();

  const senderId = item.user_id;
  const senderName = item.username;

  const { user } = useGlobalContext();

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

        tempSocket.on("both-connected", () => {
          console.log("Both users connected to chat");
          setIsLoading(true);
        });
        tempSocket.on("socket-disconnected", (message) => {
          socketRef.current.disconnect();
          setIsLoading(false);
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
        console.error("Error connecting to socket:", error);
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

  const handleSend = useCallback(
    (newMessages = []) => {
      const message = newMessages[0];

      if (!socketRef.current) {
        console.warn("Socket not initialized");
        return;
      }

      // Emit the message to the server
      socketRef.current.emit("send-chat-message", {
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
                color={Colors.light.contrast}
            />
        </TouchableOpacity>
      </View>

      {!isLoading ? (
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
