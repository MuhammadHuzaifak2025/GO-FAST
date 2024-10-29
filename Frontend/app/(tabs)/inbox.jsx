import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const initialMessages = [
  { id: '1', text: 'Hello! Is this ride still available?', sender: 'user' },
  { id: '2', text: 'Yes, it is. Are you interested?', sender: 'driver' },
  { id: '3', text: 'Yes! Could I join at 8:30 AM?', sender: 'user' },
];

const MessageItem = ({ text, sender }) => (
  <LinearGradient
    colors={sender === 'user' ? ['#ff6347', 'tomato'] : ['#f0f0f0', '#dcdcdc']}
    style={[styles.messageItem, sender === 'user' ? styles.userMessage : styles.driverMessage]}
  >
    <Text style={sender === 'user' ? styles.userText : styles.driverText}>{text}</Text>
  </LinearGradient>
);

const Inbox = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: Date.now().toString(), text: newMessage, sender: 'user' }]);
      setNewMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inbox</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem text={item.text} sender={item.sender} />}
        style={styles.messageList}
        inverted
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'tomato',
    textAlign: 'center',
    marginVertical: 15,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messageItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  driverMessage: {
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#fff',
  },
  driverText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: 'tomato',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Inbox;
