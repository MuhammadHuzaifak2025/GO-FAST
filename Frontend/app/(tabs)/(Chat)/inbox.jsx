import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { GiftedChat, Bubble, Send, InputToolbar } from "react-native-gifted-chat";
import io from "socket.io-client";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { router, useLocalSearchParams } from "expo-router";
import { getToken } from "../../../utils/expo-store";
import { v4 as uuidv4 } from "uuid";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";

const ChatScreen = () => {
  const { width, height } = useWindowDimensions();
  const item = useLocalSearchParams();
  const senderId = item.user_id;
  const senderName = item.username;
  const [isOnline, setIsOnline] = useState(false);
  const { user } = useGlobalContext();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
          if (item?.request_id) {
            tempSocket.emit("request-ride-chat", { request_id: item.request_id });
          }
        });

        tempSocket.on("reconnects", () => {
          tempSocket.emit("reconnect", { "request_id": item.request_id });
        });

        tempSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        tempSocket.on("both-connected", () => {
          console.log("Both-connected event received");
          setIsOnline(true);
        });

        tempSocket.on("all-messages", (messages) => {
          try {
            const newMessages = messages.messages;
            if (!Array.isArray(newMessages)) {
              console.error("Invalid messages format: Expected an array.", newMessages);
              setIsLoading(false);
              return;
            }

            const formattedMessages = newMessages
              .map((message) => {
                if (
                  typeof message.chat_message_id === "undefined" ||
                  typeof message.message === "undefined" ||
                  typeof message.timestamp === "undefined" ||
                  typeof message.sender === "undefined"
                ) {
                  console.warn("Skipping invalid message:", message);
                  return null;
                }
                return {
                  _id: message.chat_message_id,
                  text: message.message,
                  createdAt: new Date(message.timestamp),
                  user: {
                    _id: message.sender === user.user_id ? message.sender : senderId,
                    name: message.sender === user.user_id ? user.username : senderName,
                  },
                };
              })
              .filter((msg) => msg !== null);

            setMessages(formattedMessages);
            setIsLoading(false);
          } catch (error) {
            console.error("Error processing messages:", error);
            setIsLoading(false);
          }
        });

        tempSocket.on("socket-disconnected", () => {
          setIsOnline(false);
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
                isRecieved: true,
              },
            ])
          );
        });
      } catch (error) {
        console.error("Error connecting to socket:", error.message);
        setIsLoading(false);
      }
    };

    connectToSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected");
      }
    };
  }, [item.request_id, user.user_id, user.username, senderId, senderName]);

  const handleSend = useCallback(
    (newMessages = []) => {
      const message = newMessages[0];

      if (!socketRef.current) {
        console.warn("Socket not initialized");
        return;
      }

      socketRef.current.emit("send-chat-message", {
        request_id: item.request_id,
        reciever: item?.user_id,
        message: message.text,
        timestamp: new Date().toISOString(),
        senderId,
        senderName,
        online: isOnline,
      });

      setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    },
    [senderId, senderName, item.request_id, isOnline]
  );

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: Colors.light.primary,
          },
          left: {
            backgroundColor: '#f0f0f0',
          },
        }}
        textStyle={{
          right: {
            color: '#ffffff',
          },
          left: {
            color: '#000000',
          },
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={24} color={Colors.light.primary} />
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => router.replace("/chat-list")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.senderName}>{senderName}</Text>
        <View style={styles.onlineStatus}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? Colors.light.primary : 'tomato' }]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Connecting to chat...</Text>
        </View>
      ) : (
        <GiftedChat
          messages={messages}
          onSend={(messages) => handleSend(messages)}
          user={{
            _id: user.user_id,
            name: user.username,
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderInputToolbar={renderInputToolbar}
          alwaysShowSend
          scrollToBottom
          infiniteScroll
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.contrast,
  },
  header: {
    backgroundColor: Colors.light.contrast,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    // flex: 1,
  },
  backButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  senderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    color: 'black'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
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
  sendButton: {
    marginRight: 10,
    marginBottom: 5,
  },
  inputToolbar: {
    // paddingHorizontal: 10,
    // paddingVertical: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    borderWidth: 0,
    // borderColor: "#ff6347", // Tomato border for the filter container
    borderRadius: 12,
    // padding: 15,
    backgroundColor: "#f9f9f9", // Light background for the filter section
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
    // justifyContent: "center",
  },
  inputPrimary: {
    // fontSize: 16,
    color: '#333',
  },
});

export default ChatScreen;

