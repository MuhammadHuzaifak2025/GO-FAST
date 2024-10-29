import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const travelHistory = [
  { id: '1', from: 'University', to: 'Downtown', date: '2024-10-20', time: '08:00 AM' },
  { id: '2', from: 'City Center', to: 'Station', date: '2024-10-18', time: '05:00 PM' },
  { id: '3', from: 'Park', to: 'Library', date: '2024-10-16', time: '09:00 AM' },
];

const RideCard = ({ from, to, date, time }) => (
  <LinearGradient
    colors={['#ff6347', 'tomato']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.rideCard}
  >
    <Text style={styles.rideText}>From: {from}</Text>
    <Text style={styles.rideText}>To: {to}</Text>
    <Text style={styles.rideInfo}>Date: {date}</Text>
    <Text style={styles.rideInfo}>Time: {time}</Text>
  </LinearGradient>
);

const YourRides = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Travel History</Text>
      <FlatList
        data={travelHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideCard from={item.from} to={item.to} date={item.date} time={item.time} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'tomato',
    textAlign: 'center',
    marginBottom: 20,
  },
  rideCard: {
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  rideText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  rideInfo: {
    fontSize: 16,
    color: '#f8f8f8',
    marginTop: 5,
  },
});

export default YourRides;
