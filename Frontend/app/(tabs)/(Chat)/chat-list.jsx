import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { FlashList } from '@shopify/flash-list';
import { setAuthHeaders } from '../../../utils/expo-store';
import { useToast } from 'react-native-toast-notifications';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from "../../../constants/Colors";
// import { process } from "../../../constants";

const ChatComponent = ({item}) => {

  const rideDate = new Date(item.start_time);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
  ];

  let hours = rideDate.getHours();
  let minutes = rideDate.getMinutes();
  const newformat = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  const formatTime = `${hours}:${minutes} ${newformat}`;

  return (
    <View style={styles.rideItemContainer}>
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push({ pathname: 'inbox', params: item })}
        >
        <View style={styles.chatContent}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          
          {/* Text Section */}
          <View style={styles.chatTextContainer}>
            <Text style={styles.chatUsername} numberOfLines={1} ellipsizeMode="tail">
              {item.username}
            </Text>
            <Text style={styles.rideTime}>
                    {weekday[rideDate.getDay()]}, {rideDate.getDate()}{" "}
                    {month[rideDate.getMonth()]} • {formatTime}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const ChatList = () => {

  const toast = useToast();
  
  const [chat, setChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // const {uses}

  const fetchRequests = async () => {

    try {
      setChat([]);
      setIsLoading(true);

      setAuthHeaders();
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/requests/chat`);
      // console.log(response.data);

      if (response.status === 200) {

        setChat((response.data.data.Driver).concat(response.data.data.Passenger));
        console.log(chat);
        setIsLoading(false);
      }
      else {
        throw new Error(response);
      }

    } catch (error) {

      if (error.response.data.message === 'No ride request found') {

      }
      else {
        console.log(error.response);

        toast.show(error.response.data.message, {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
      }
      setIsLoading(false);
    }

  }


  useFocusEffect(
    React.useCallback(() => {

      fetchRequests();


    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inbox</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : (
        <FlashList 
          estimatedItemSize={100}
          data={chat}
          keyExtractor={(item) => item.request_id}
          renderItem={({ item }) => (
            <ChatComponent item={item} />
          )}
          ListEmptyComponent={() => (
            <Text style={styles.subheading}>No chats available.</Text>
          )}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchRequests();
            setRefreshing(false);
          }}
          removeClippedSubviews={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    // backgroundColor: '#fff',
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterIcon: {
    padding: 10,
  },
  sameLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 0,
    borderColor: '#ff6347', // Tomato border for the filter container
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#f9f9f9', // Light background for the filter section
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideItemContainer: {
    flex: 1,
    marginVertical: 10,
    alignSelf: 'center',
  },
  rideItem: {
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  usernameText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  rideText: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  rideTime: {
    fontSize: 14,
    color: Colors.light.primary,
    // marginTop: 10,
    fontWeight: 'bold',
  },
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: '#e0e0e0',
    borderWidth:
      1,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 10,
  },
  seatIcon: {
    // marginRight: 4,
  },
  cross: {
    padding: 5,
  },
  picker: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  seatText: {
    color: '#fff',
    fontSize: 14,
    // marginRight: 5,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  moreLoading: {
    marginVertical: 20,
  },
  formField: {
    marginVertical: 10,
  },
  rideItemContainer: {
    flex: 1,
    marginVertical: 5,
    alignSelf: 'stretch',
    paddingHorizontal: 15,
  },
  
  rideItemContainer: {
    flex: 1,
    marginVertical: 5,
    alignSelf: 'stretch',
    paddingHorizontal: 15,
  },
  
  chatItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 5,
  },
  
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#d1d1d1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  chatTextContainer: {
    // flex: 1, /* Ensure text container takes available space */
    justifyContent: 'center',
  },
  
  chatUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  chatLastMessage: {
    fontSize: 14,
    color: '#666', /* Softer color for secondary text */
    marginTop: 4,
  },
});

export default ChatList;