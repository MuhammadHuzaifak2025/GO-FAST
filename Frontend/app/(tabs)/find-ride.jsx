// import { View, Text } from 'react-native'
// import React from 'react'

// const FindRide = () => {
//   return (
//     <View>
//       <Text>FindRide</Text>
//     </View>
//   )
// }
import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';

const rides = [
  { id: '1', from: 'Downtown', to: 'University', time: '08:30 AM', username: 'Alex' },
  { id: '2', from: 'Station', to: 'City Center', time: '09:00 AM', username: 'Maria' },
  { id: '3', from: 'Airport', to: 'Hotel', time: '07:15 PM', username: 'John' },
  { id: '4', from: 'Library', to: 'Park', time: '06:00 PM', username: 'Sara' },
  { id: '5', from: 'Library', to: 'Park', time: '06:00 PM', username: 'Sara' },
];

const RideItem = ({ from, to, time, username }) => (
  <LinearGradient
    colors={['tomato', '#ff6347']}
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
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Rides</Text>
      <FlatList
        data={rides}
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
    color: 'tomato',
    textAlign: 'center',
    marginVertical: 20,
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
