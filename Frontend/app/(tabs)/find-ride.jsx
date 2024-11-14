import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';


// Sample ride data
const rides = [
  { id: '1', from: 'Downtown', to: 'University', time: '08:30 AM', username: 'Alex', seats: 3 },
  { id: '2', from: 'Station', to: 'City Center', time: '09:00 AM', username: 'Maria', seats: 2 },
  { id: '3', from: 'Airport', to: 'Hotel', time: '07:15 PM', username: 'John', seats: 4 },
  { id: '4', from: 'Library', to: 'Park', time: '06:00 PM', username: 'Sara', seats: 1 },
  { id: '5', from: 'Library', to: 'Park', time: '06:00 PM', username: 'Sara', seats: 1 },
];

// Renders each ride in a list item
const RideItem = ({ from, to, time, username }) => (
  <LinearGradient
    colors={['black', '#ff6347']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.rideItem}
  >
    <View style={styles.rideHeader}>
      <FontAwesome name="car" size={24} color="#fff" />
      <Text style={styles.usernameText}>{username}</Text>
    </View>
    <Text style={styles.rideText}>From: {from}</Text>
    <Text style={styles.rideText}>To: {to}</Text>
    <Text style={styles.rideTime}>{time}</Text>
  </LinearGradient>
);

const FindRide = () => {
  const [filteredRides, setFilteredRides] = useState(rides);
  const [preference, setPreference] = useState({seats: '', time: '', pickup: '', dropoff: ''});

  // Function to filter rides based on seats and time
  const filterRides = () => {
    const filtered = rides.filter(ride => {
      const rideSeats = parseInt(ride.seats, 10);
      const requestedSeats = parseInt(preference.seats, 10);
      return (
        (!requestedSeats || rideSeats >= requestedSeats) &&
        (!preference.time || ride.time === preference.time) && 
        (!preference.pickup || ride.from === preference.pickup) && 
        (!preference.dropoff || ride.to === preference.dropoff)
      );
    });
    setFilteredRides(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Rides</Text>

      <View style={styles.filterContainer}>
        <FormField
          placeholder="Seats required"
          keyboardType="numeric"
          value={preference.seats}
          handleChangeText={(e) => setPreference({...preference, seats: e})}
        />
        <FormField
          placeholder="Preferred Time (e.g., 08:30 AM)"
          value={preference.time}
          handleChangeText={(e) => setPreference({...preference, time: e})}
        />
        <FormField
          placeholder="Preferred Pickup Location"
          value={preference.pickup}
          handleChangeText={(e) => setPreference({...preference, pickup: e})}
        />
        <FormField
          placeholder="Preferred Dropoff Location"
          value={preference.dropoff}
          handleChangeText={(e) => setPreference({...preference, dropoff: e})}
        />
        <CustomButton textContent="Find Rides" handlePress={filterRides} containerStyles={{marginTop: 20}}/>
      </View>

      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideItem from={item.from} to={item.to} time={item.time} username={item.username} />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    marginTop: 20,
    paddingTop: 20,
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginVertical: 20,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  rideItem: {
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
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
    color: '#f8f8f8',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default FindRide;
