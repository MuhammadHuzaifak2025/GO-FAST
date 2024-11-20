import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import CustomButton from '../../components/CustomButton';
import { useToast } from 'react-native-toast-notifications';
import { useGlobalContext } from '../../context/GlobalProvider';
import { resetSecureStore, setAuthHeaders } from '../../utils/expo-store';
import { router } from 'expo-router';

import CarModal from '../../components/CarModal';

const Profile = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useGlobalContext();
  const toast = useToast();

  const [stats, setStats] = useState({
    monthlyRides: 0,
    totalDistance: 0,
    savedCarbon: 0,
  });

  const [isLogOut, setIsLogOut] = useState(false);

  const [registerCarDisplay, setRegisterCarDisplay] = useState(false);

  const handleswitch = () => {
    router.replace('/find-ride');
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await setAuthHeaders(axios);
        const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/stats`);
        setStats(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchStats();
  }, []);

  const handleLogOut = async () => {
    setIsLogOut(true);
    try {
      await setAuthHeaders(axios);
      const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/logout`, {}, { withCredentials: true });
      if (response.status === 200) {
        setUser(null);
        setIsAuthenticated(false);
        toast.show("Successfully Logged Out", { type: "success", duration: 6000, offset: 30 });
        await resetSecureStore(axios);
        router.replace('/')
      } else {
        throw new Error(response);
      }
    } catch (error) {
      console.log(error);
      toast.show(error?.response?.data?.message, { type: "danger", duration: 4000, offset: 30 });
    }
    setIsLogOut(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>

        <CarModal visible={registerCarDisplay}
          onClose={() => setRegisterCarDisplay(false)} />

        <Text style={styles.title}>Profile</Text>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Text style={styles.statsTitle}>Monthly Ride Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <FontAwesome5 name="car" size={24} color="tomato" />
            <Text style={styles.statLabel}>Rides this Month</Text>
            <Text style={styles.statValue}>{stats.monthlyRides}</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="map-marker-distance" size={24} color="tomato" />
            <Text style={styles.statLabel}>Total Distance</Text>
            <Text style={styles.statValue}>{stats.totalDistance} km</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="leaf-outline" size={24} color="tomato" />
            <Text style={styles.statLabel}>Saved Carbon</Text>
            <Text style={styles.statValue}>{stats.savedCarbon} kg</Text>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Account Options</Text>
          <CustomButton textContent="Reset Password" handlePress={() => { }} containerStyles={styles.optionButton} />
          <CustomButton textContent="Register Car" handlePress={() => { setRegisterCarDisplay(true) }} containerStyles={styles.optionButton} />
          <CustomButton textContent="Sign Out" handlePress={handleLogOut} isLoading={isLogOut} containerStyles={styles.optionButton} />
          <CustomButton textContent="Switch Modes" handlePress={handleswitch} containerStyles={styles.optionButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'tomato',
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'tomato',
    marginVertical: 20,
    textAlign: 'center',
  },
  statsContainer: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffe4e1',
    borderRadius: 10,
    width: '30%',
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'tomato',
    marginTop: 5,
  },
  optionsContainer: {
    width: '90%',
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'tomato',
    marginBottom: 10,
  },
  optionButton: {
    marginVertical: 10,
  },
  modalContainer: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: '80%',
    width: '100%',
  },
});

export default Profile;
