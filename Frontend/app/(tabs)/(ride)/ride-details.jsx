import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { setAuthHeaders } from '../../../utils/expo-store';
import axios from 'axios';
import { useToast } from 'react-native-toast-notifications';

const RideDetailsScreen = () => {

  const [ seatsRequested, setSeatsRequested ]= useState(0);
  const [ total, setTotal ] = useState(0);
  
  const toast = useToast();

  const { ride } = useGlobalContext();
  const maxSeats = ride.seat_available;

  const rideDate = new Date(ride.start_time);
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

  const time = `${hours}:${minutes} ${newformat}`;

  const sendRequest = async () => {

    try{
      await setAuthHeaders(axios);

      if(seatsRequested === 0){
        toast.show('Please select seats required', {
          type: "danger",
          duration: 4000,
          offset: 30,
          animationType: "slide-in",
        });
        return;
      }

      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request`, {'rideId': ride.ride_id, 'seats': seatsRequested});

      if(response.status === 200){
        toast.show("Request sent successfully", {
          type: "success",
          duration: 5000,
          offset: 30,
          animationType: "slide-in",
        });

        router.replace('/find-ride');
      }
      else{
        throw new Error(response);
      }
    }
    catch(error){

      console.log(error.response);
      
      toast.show(error.response.data.message, {
        type: "danger",
        duration: 4000,
        offset: 30,
        animationType: "slide-in",
      });
      
      router.replace('/find-ride');
    }
  };
  useEffect(() => {
    
    if (!ride) {
      router.replace("/find-ride");
    }
  }, []);
  
  useEffect(() => {
    
    setTotal(Math.floor(parseInt(ride.fare,10) * seatsRequested));
  }, [seatsRequested]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.back}>
          <TouchableOpacity onPress={() => router.replace("/find-ride")}>
            <Ionicons name="arrow-back" size={28} color="#EC5F5F" />
          </TouchableOpacity>
        </View>

        <Text style={styles.driverName}>{ride.username}</Text>

        <View style={styles.emptySpace} />
      </View>

      {/* Date */}
      <Text style={styles.date}>
        {weekday[rideDate.getDay()]}, {rideDate.getDate()} {month[rideDate.getMonth()]}
      </Text>

      {/* Time and Price */}
      <View style={styles.timePriceRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.label}>Leaving at:</Text>
          <Text style={styles.timeHeader}>{time}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.label}>Price per seat:</Text>
          <Text style={styles.priceHeader}>Rs: {Math.floor(ride.fare)}</Text>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.tripDetails}>
        <View style={styles.locationRow}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              Starting: {ride.routes[0]?.route_name || "Unknown"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationRow}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>
              Destination: {ride.routes[1]?.route_name || "Unknown"}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Driver */}
      <TouchableOpacity style={styles.contactButton}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#e74c3c" />
        <Text style={styles.contactText}>Contact {ride.username}</Text>
      </TouchableOpacity>

      {/* Vehicle Details */}
      <Text style={styles.vehicleDetails}>Seats available: {ride.seat_available}</Text>
      <Text style={styles.vehicleDetails}>{ride.vehicle.make} {ride.vehicle.model}</Text>
      <Text style={styles.vehicleColor}>{ride.vehicle.color}</Text>

      <Picker
          selectedValue={seatsRequested}
          onValueChange={(e) => setSeatsRequested(e)}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item label="Select seats required" value={0} />
          {Array.from({ length: maxSeats }, (_, index) => index + 1).map((seat) => (
            <Picker.Item key={seat} label={`${seat}`} value={seat} />
          ))}

      </Picker>
      
      <Text style={styles.fare}>Total Fare  
        <Text style={styles.priceHeader}> Rs: {Math.floor(parseInt(ride.fare,10) * parseInt(seatsRequested,10))}</Text>
      </Text>

      {/* Request Button */}
      <TouchableOpacity style={styles.requestButton} onPress={sendRequest}>
        <Text style={styles.requestButtonText}>Request for ride</Text>
      </TouchableOpacity>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  back: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  driverName: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333",
    textAlign: "center", // Ensures proper centering
    flex: 1, // Allows text to take space equally between the back button and empty space
  },
  emptySpace: {
    width: 36, // Matches the width of the back button for symmetry
  },
  date: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginBottom: 16,
    color: "#333",
  },
  timePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    marginRight: 12
    
  },
  timeContainer: {
    alignItems: "flex-start",
  },
  priceContainer: {
    alignItems: "flex-start",
  },
  label: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#666",
  },
  timeHeader: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#e74c3c",
  },
  priceHeader: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#e74c3c",
  },
  tripDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  locationInfo: {
    marginLeft: 8,
    flex: 1,
  },
  locationTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbe9e7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  contactText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#e74c3c",
    marginLeft: 8,
  },
  vehicleDetails: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#444",
  },
  vehicleColor: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#888",
  },
  requestButton: {
    position: 'absolute', // Make the button fixed
    bottom: 20, // Space above the tab bar or screen bottom
    left: 16, // Space from the left
    right: 16, // Space from the right
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4, // Add some shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  requestButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#fff",
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
  fare: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#666",
  },
});

export default RideDetailsScreen;
