import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Animated, Dimensions, useWindowDimensions } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from "react-native-toast-notifications";
import { setAuthHeaders } from '../../utils/expo-store';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

const RequestItem = ({ time, car, refreshRides, username, req_id }) => {
  const toast = useToast();
  const { width } = useWindowDimensions();

  const rideDate = new Date(time);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const month = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
      "Are you sure you want to delete this request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await setAuthHeaders(axios);
              const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/${req_id}`);

              if (response.status === 200) {
                toast.show('Request deleted successfully', {
                  type: "success",
                  duration: 4000,
                  offset: 30,
                  animationType: "slide-in",
                });

                if (refreshRides) refreshRides();
              } else {
                throw new Error(response);
              }
            } catch (error) {
              // console.log(error.response);
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
      colors={['#1e1e1e', '#3d3d3d']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.requestItem, { width: width - 40 }]}
    >
      <TouchableOpacity style={styles.deleteIcon} onPress={handleDelete}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      <View style={styles.rideHeader}>
        <FontAwesome name="user-circle" size={24} color="#ff6347" />
        <Text style={styles.usernameText}>{username}</Text>
      </View>
      <Text style={styles.rideTime}>{weekday[rideDate.getDay()]}, {rideDate.getDate()} {month[rideDate.getMonth()]} • {formatTime}</Text>
      <Text style={styles.rideText}>{car.color} {car.make} {car.model}</Text>
    </LinearGradient>
  );
};

const RequestRideItem = ({ time, car, refreshRides, username, req_id }) => {
  const { width } = useWindowDimensions();
  const rideDate = new Date(time);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const month = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  let hours = rideDate.getHours();
  let minutes = rideDate.getMinutes();
  const newformat = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  hours = hours < 10 ? `0${hours}` : hours;
  minutes = minutes < 10 ? `0${minutes}` : minutes;

  const formatTime = `${hours}:${minutes} ${newformat}`;

  return (
    <LinearGradient
      colors={['#1e1e1e', '#3d3d3d']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.requestItem, { width: width - 40 }]}
    >
      <View style={styles.rideHeader}>
        <FontAwesome name="car" size={24} color="#ff6347" />
        <Text style={styles.usernameText}>{username}</Text>
      </View>
      <Text style={styles.rideTime}>{weekday[rideDate.getDay()]}, {rideDate.getDate()} {month[rideDate.getMonth()]} • {formatTime}</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginRight: 20}}>
        <Text style={styles.rideText}>{car.color} {car.make} {car.model}</Text>
        <Text style={styles.rideText}>Registration#: {car.registration_number}</Text>
      </View>
    </LinearGradient>
  );
};

const YourRequests = () => {
  const { height, width } = useWindowDimensions();
  const [requests, setRequests] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setRequests(response.data.message);
      } else {
        throw new Error(response);
      }
    } catch (error) {
      // console.error('Error fetching requests:', error.response);
      if (error.response?.data?.message !== 'No pending requests found') {
        toast.show('Error fetching your requests, please try again later', {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (check) => {
    const toValue = check === 'pending' 
      ? (isDropdownOpenForm ? 0 : height - 200)
      : (isDropdownOpenList ? 0 : height - 200);

    Animated.timing(check === 'pending' ? dropdownHeightForm : dropdownHeightList, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (check === 'pending') {
      setIsDropdownOpenForm(!isDropdownOpenForm);
      if (isDropdownOpenList) toggleDropdown('list');
    } else {
      setIsDropdownOpenList(!isDropdownOpenList);
      if (isDropdownOpenForm) toggleDropdown('pending');
    }
  };

  const fetchOngoing = async () => {
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/ongoing`);
      if (response.status === 200) {
        setRides(response.data.data);
      }
    } catch (error) {
      // console.error('Error fetching ongoing rides:', error.response);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
      fetchOngoing();
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
        <Ionicons name={isDropdownOpenForm ? 'chevron-up' : 'chevron-down'} size={24} color="#ff6347" />
      </TouchableOpacity>

      <Animated.View style={[styles.dropdownContainer, { height: dropdownHeightForm }]}>
        <FlashList
          estimatedItemSize={179}
          data={requests}
          keyExtractor={(item) => item.ride_id}
          renderItem={({ item }) => (
            <RequestItem
              username={item.username}
              time={item.start_time}
              car={{ color: item.color, make: item.make, model: item.model }}
              req_id={item.request_id}
              refreshRides={fetchRequests}
            />
          )}
          ListEmptyComponent={() => (<Text style={styles.subheading}>No requests pending</Text>)}
          contentContainerStyle={styles.listContentContainer}
        />
      </Animated.View>

      <TouchableOpacity style={styles.toggleButton} onPress={() => toggleDropdown('list')}>
        <Text style={styles.title}>Manage Rides</Text>
        <Ionicons name={isDropdownOpenList ? 'chevron-up' : 'chevron-down'} size={24} color="#ff6347" />
      </TouchableOpacity>

      <Animated.View style={[styles.dropdownContainer, { height: dropdownHeightList }]}>
        <FlashList
          estimatedItemSize={191}
          data={rides}
          keyExtractor={(item) => item.passenger_ride_id}
          renderItem={({ item }) => (
            <RequestRideItem
              id={item.ride_id}
              time={item.start_time}
              car={item.vehicle}
              refreshRides={fetchOngoing}
              username={item.username}
            />
          )}
          ListEmptyComponent={() => (<Text style={styles.subheading}>No Upcoming Rides</Text>)}
          contentContainerStyle={styles.listContentContainer}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6347',
    marginVertical: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownContainer: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  requestItem: {
    marginBottom: 15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    fontWeight: 'bold',
  },
  rideText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 5,
  },
  rideTime: {
    color: '#ff6347',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    color: '#ff6347',
    marginTop: 10,
    fontSize: 16,
  },
  subheading: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6347',
    marginTop: 20,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
});

export default YourRequests;
