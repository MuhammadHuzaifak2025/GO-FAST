import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Dimensions } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import FormField from '../../components/FormField';
import { useGlobalContext } from '../../context/GlobalProvider';
import { useToast } from "react-native-toast-notifications";
import { setAuthHeaders } from '../../utils/expo-store';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { FlashList } from '@shopify/flash-list';

const RequestItem = ({ time, car, refreshRides, username, req_id }) => {

  const toast = useToast();

  const rideDate = new Date(time);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  let hours = rideDate.getHours();
  let minutes = rideDate.getMinutes();
  const newformat = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  const formatTime = `${hours}:${minutes} ${newformat}`;

  const handleDelete = async () => {
    Alert.alert(
      "Delete Request",
      "You sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {

              await setAuthHeaders(axios); // Set authorization headers
              const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/${req_id}`);

              if (response.status === 200) {
                toast.show('Request deleted successfully', {
                  type: "success",
                  duration: 4000,
                  offset: 30,
                  animationType: "slide-in",
                });

                if (refreshRides) refreshRides(); // Refresh the rides list if a refresh function is provided
              } else {
                throw new Error(response);
              }
            } catch (error) {
              console.log(error.response);
              toast.show('Failed to delete request. Please try again.', {
                type: "danger",
                duration: 4000,
                offset: 30,
                animationType: "slide-in",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['black', '#ff6347']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.RequestItem}
    >
      {/* Delete Icon */}
      <TouchableOpacity style={styles.deleteIcon} onPress={handleDelete}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.rideHeader}>
        <FontAwesome name="check" size={24} color="#fff" />
        <Text style={styles.usernameText}>{username}</Text>
      </View>
      <Text style={styles.rideTime}>Start Date: {weekday[rideDate.getDay()]}, {rideDate.getDate()} {month[rideDate.getMonth()]}</Text>
      <Text style={styles.rideTime}>Start Time: {formatTime}</Text>
      <Text style={styles.rideText}>Vehicle: {car.color} {car.make} {car.model}</Text>

    </LinearGradient>
  );
};

const RequestRideItem = ({ time, car, refreshRides, username, req_id }) => {
  console.log("MYRIDE", req_id, time, car, refreshRides, username);
  const toast = useToast();

  const rideDate = new Date(time);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  let hours = rideDate.getHours();
  let minutes = rideDate.getMinutes();
  const newformat = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  const formatTime = `${hours}:${minutes} ${newformat}`;

  const handleDelete = async () => {
    Alert.alert(
      "Delete Request",
      "You sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {

              await setAuthHeaders(axios); // Set authorization headers
              const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/${req_id}`);

              if (response.status === 200) {
                toast.show('Request deleted successfully', {
                  type: "success",
                  duration: 4000,
                  offset: 30,
                  animationType: "slide-in",
                });

                if (refreshRides) refreshRides(); // Refresh the rides list if a refresh function is provided
              } else {
                throw new Error(response);
              }
            } catch (error) {
              console.log(error.response);
              toast.show('Failed to delete request. Please try again.', {
                type: "danger",
                duration: 4000,
                offset: 30,
                animationType: "slide-in",
              });
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['black', '#ff6347']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.RequestItem}
    >
      {/* Delete Icon */}
      <TouchableOpacity style={styles.deleteIcon} onPress={handleDelete}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.rideHeader}>
        <FontAwesome name="check" size={24} color="#fff" />
        <Text style={styles.usernameText}>{username}</Text>
      </View>
      <Text style={styles.rideTime}>Start Date: {weekday[rideDate.getDay()]}, {rideDate.getDate()} {month[rideDate.getMonth()]}</Text>
      <Text style={styles.rideTime}>Start Time: {formatTime}</Text>
      <Text style={styles.rideText}>Vehicle: {car.color} {car.make} {car.model}</Text>

    </LinearGradient>
  );
};

const YourRequests = () => {

  const height = Dimensions.get('window').height - 200;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rides, setRides] = useState([

  ]);
  const [isDropdownOpenList, setIsDropdownOpenList] = useState(false);
  const [isDropdownOpenForm, setIsDropdownOpenForm] = useState(false);

  const [dropdownHeightList] = useState(new Animated.Value(0));
  const [dropdownHeightForm] = useState(new Animated.Value(0));

  const toast = useToast();

  const fetchRequests = async () => {

    setLoading(true);
    try {

      await setAuthHeaders(axios);

      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/requests/pending`);

      if (response.status === 200) {

        console.log("hello", response);
        setRequests(response.data.message);
        setLoading(false);
      }
      else {
        throw new Error(response);
      }
    } catch (error) {

      if (error.response.data.message === 'No pending requests found') {

      }
      else {

        toast.show('Error fetching your requests, please try again later', {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
      }
      setLoading(false);
    }
  };

  const toggleDropdown = (check) => {
    console.log(isDropdownOpenForm);
    console.log(isDropdownOpenList)
    if (check === 'pending') {

      const toValue = isDropdownOpenForm ? 0 : height; // Adjust this value based on your needs
      Animated.timing(dropdownHeightForm, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (isDropdownOpenList && !isDropdownOpenForm) {
        toggleDropdown('list');
      }

      setIsDropdownOpenForm(!isDropdownOpenForm);

    }
    else {

      const toValue = isDropdownOpenList ? 0 : 500; // Adjust this value based on your needs

      Animated.timing(dropdownHeightList, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();

      if (isDropdownOpenForm && !isDropdownOpenList) {
        toggleDropdown('pending');
      }

      setIsDropdownOpenList(!isDropdownOpenList);
    }
  };

  const fetchongoing = async () => {
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/ongoing`);
      if (response.status = 200) {
        setRides(response.data.data);
        console.log("Helladhasl", response.data.message)

      }
    } catch (error) {
      console.log("Hello2")
      console.error(error.response);
    }
  }

  useFocusEffect(
    React.useCallback(() => {

      fetchRequests();
      fetchongoing();

      return () => {
      };
    }, [])
  );



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6347" />
        <Text style={styles.loadingText}>Loading pending requests...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <TouchableOpacity style={styles.toggleButton} onPress={() => toggleDropdown('pending')}>
        <Text style={styles.title}>Your Pending Requests</Text>
        <Ionicons name={isDropdownOpenForm ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
      </TouchableOpacity>

      <Animated.View style={{ height: dropdownHeightForm, overflow: 'hidden' }}>
        <FlashList
          estimatedItemSize={179}
          data={requests}
          keyExtractor={(item) => item.ride_id}
          renderItem={({ item }) => (
            <RequestItem
              // from={item.routes[0].route_name}
              // to={item.routes[1].route_name}
              username={item.username}
              time={item.start_time}
              price={item.fare}
              seats={item.seat_available}
              car={{ color: item.color, make: item.make, model: item.model }}
              req_id={item.request_id}
              refreshRides={fetchRequests}
            />
          )}
          ListEmptyComponent={() => (<Text style={styles.subheading}>No requests pending</Text>)}
          contentContainerStyle={{ paddingBottom: 20 }}

        />
      </Animated.View>

      <TouchableOpacity style={styles.toggleButton} onPress={() => toggleDropdown('list')}>
        <Text style={styles.title}>Manage Rides</Text>
        <Ionicons name={isDropdownOpenList ? 'chevron-up' : 'chevron-down'} size={24} color="#000" />
      </TouchableOpacity>

      <Animated.View style={{ height: dropdownHeightList, overflow: 'hidden' }}>
        {loading ? (<View style={styles.loadingContainer}>

          <Text style={styles.loadingText}>Loading...</Text>
          <ActivityIndicator size="large" color="#ff6347" />
        </View>
        ) : (
          <FlashList
            estimatedItemSize={191}
            data={rides}
            keyExtractor={(item) => item.passenger_ride_id}
            renderItem={({ item }) => (
              <RequestRideItem
                id={item.ride_id}
                // from={item.routes[0].route_name}
                // to={item.routes[1].route_name}
                time={item.start_time}
                price={item.fare || 0}
                seats={item.seat_available}
                car={item.vehicle}
                refreshRides={fetchongoing}
              />
            )}
            ListEmptyComponent={() => (<Text style={styles.subheading}>No pending requ</Text>)}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 70,
    backgroundColor: '#ffffff', // Changed background to white
  },
  title: {
    flex: 1,
    paddingRight: 10,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ff6347', // Changed title color to tomato
    textAlign: 'center',
    marginVertical: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  input: {
    backgroundColor: '#ffffff', // Input background is white
    borderRadius: 10,
    color: '#333', // Darker text for better readability
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ff6347', // Border color set to tomato
    elevation: 2, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    backgroundColor: '#ffffff', // Picker background is white
    color: '#333', // Darker text for better readability
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    height: 50, // Increased height for better touch target
    borderWidth: 1,
    borderColor: '#ff6347', // Border color set to tomato
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  publishButton: {
    backgroundColor: '#ff6347', // Button background set to tomato
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3, // Adding elevation for shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  publishButtonText: {
    color: '#ffffff', // Button text color set to white
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Loading container background is white
  },
  loadingText: {
    color: '#ff6347', // Loading text color set to tomato
    marginTop: 10,
    fontSize: 16,
  },
  dateTimeField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: '#ff6347', // Tomato border
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#fff', // White background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateTimeText: {
    fontSize: 16,
    color: 'black',
    flex: 1, // Allow text to take available space
    marginLeft: 10,
  },

  cross: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    padding: 15,
    borderRadius: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    marginVertical: 0,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
  },
  RequestItem: {
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  usernameText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  rideText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  rideTime: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  seatText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  seatIcon: {
    marginHorizontal: 2,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000', // Tomato color for the subheading
    marginTop: 20,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // dropdownContent: {
  //   marginTop: 10,
  //   padding: 10,
  //   backgroundColor: '#fff',
  //   borderRadius: 10,
  //   elevation: 3,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.3,
  // },
});

export default YourRequests;
