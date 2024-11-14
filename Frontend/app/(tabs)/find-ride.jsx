import React, { useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
// import Date
// Sample ride data
const rides = [
  { id: '1', from: 'Downtown', to: 'University', time: '08:30 AM', username: 'Alex', seats: 3 },
  { id: '2', from: 'Station', to: 'City Center', time: '09:00 AM', username: 'Maria', seats: 2 },
  { id: '3', from: 'Airport', to: 'Hotel', time: '07:15 PM', username: 'John', seats: 4 },
  { id: '4', from: 'Library', to: 'Park', time: '06:00 PM', username: 'Sara', seats: 1 },
];

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
  const [preference, setPreference] = useState({ seats: '', time: '', pickup: '', dropoff: '' });
  const [showFilter, setShowFilter] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  // Function to animate dropdown
  const toggleFilter = () => {
    if (showFilter) {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setShowFilter(!showFilter);
  };

  const animatedHeight = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  // Function to filter rides based on p\references
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
      <View style={styles.header}>
        <Text style={styles.title}>Available Rides</Text>
        <TouchableOpacity onPress={toggleFilter} style={styles.filterIcon}>
          <FontAwesome name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Animated Filter Form */}
      <Animated.View style={[styles.filterContainer, { height: animatedHeight, overflow: 'hidden' }]}>
        <ScrollView>

          <FormField
            placeholder="Seats required"
            keyboardType="numeric"
            value={preference.seats}
            handleChangeText={(e) => setPreference({ ...preference, seats: e })}
            />
          <FormField
            placeholder="Preferred Time (e.g., 08:30 AM)"
            value={preference.time}
            handleChangeText={(e) => setPreference({ ...preference, time: e })}
          />
          <FormField
            placeholder="Preferred Pickup Location"
            value={preference.pickup}
            handleChangeText={(e) => setPreference({ ...preference, pickup: e })}
            />
          <FormField
            placeholder="Preferred Dropoff Location"
            value={preference.dropoff}
            handleChangeText={(e) => setPreference({ ...preference, dropoff: e })}
          />
          <CustomButton
            textContent="Filter Rides"
            handlePress={filterRides}
            containerStyles={{ marginTop: 20 }}
            />

        </ScrollView>
      </Animated.View>

      {/* Ride List */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
    
  },
  filterIcon: {
    padding: 10,
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
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
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  seatIcon: {
    marginRight: 4,
  },
  seatText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default FindRide;
