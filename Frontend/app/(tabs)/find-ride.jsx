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

const rides = [
  { id: '1', from: 'Downtown', to: 'University', time: '08:30 AM' },
  { id: '2', from: 'Station', to: 'City Center', time: '09:00 AM' },
  { id: '3', from: 'Airport', to: 'Hotel', time: '07:15 PM' },
  { id: '4', from: 'Library', to: 'Park', time: '06:00 PM' },
];

const RideItem = ({ from, to, time }) => (
  <LinearGradient
    colors={['tomato', '#ff6347']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.rideItem}
  >
    <Text style={styles.rideText}>From: {from}</Text>
    <Text style={styles.rideText}>To: {to}</Text>
    <Text style={styles.rideTime}>{time}</Text>
  </LinearGradient>
);

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Rides</Text>
      <FlatList
        data={rides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RideItem from={item.from} to={item.to} time={item.time} />
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
    marginTop:20,
    fontSize: 24,
    fontWeight: 'bold',
    color: 'tomato',
    textAlign: 'center',
    marginVertical: 20,
  },
  rideItem: {
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  rideText: {
    fontSize: 18,
    color: '#fff',
  },
  rideTime: {
    fontSize: 16,
    color: '#f8f8f8',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default App;
