import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { setAuthHeaders } from '../../../utils/expo-store';
import { useToast } from 'react-native-toast-notifications';
import { FlashList } from '@shopify/flash-list';

const PassengerItem = ({ username, phone, fare, ride_id, passenger_id, seats, refreshPassenger }) => {


  const toast = useToast();
  const { width } = useWindowDimensions();
  
  const handleDelete = async () => {
    Alert.alert(
      "Remove Passenger",
      "Are you sure you want to remove this passenger?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await setAuthHeaders(axios);
              const response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/user/passenger/${ride_id}/${passenger_id}`);

              if (response.status === 200) {
                toast.show('Passenger removed from ride', {
                  type: "success",
                  duration: 4000,
                  offset: 30,
                  animationType: "slide-in",
                });
                if (refreshPassenger) refreshPassenger();
              } else {
                throw new Error(response);
              }
            } catch (error) {
              toast.show('Failed to delete passenger. Please try again.', {
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
      colors={['#ff7f7f', '#ffa07a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.itemContainer, { width: width - 32 }]}
    >
      <TouchableOpacity style={styles.deleteIcon} onPress={handleDelete}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>Name: {username}</Text>
        <Text style={styles.itemText}>Seats occupied: {seats}</Text>
        <Text style={styles.itemText}>Contact No.: {phone}</Text>
        <Text style={styles.itemText}>Total Fare: ${parseInt(fare, 10) * parseInt(seats, 10)}</Text>
      </View>
    </LinearGradient>
  );
};

const RequestItem = ({ username, seatsRequested, req_id, refreshRides }) => {

  const toast = useToast();
  const { width } = useWindowDimensions();
  const { myRide, setMyRide } = useGlobalContext();

  const handleRequestAction = async (action) => {
    const confirmText = action === 'accept' ? 'Accept this request?' : 'Reject this request?';
    const successMessage = action === 'accept' ? 'Request accepted successfully.' : 'Request rejected successfully.';
    console.log(myRide);

    Alert.alert(
      `${action === 'accept' ? 'Accept' : 'Reject'} Request`,
      confirmText,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: async () => {
            try {

              await setAuthHeaders(axios);
              let response;
              if (action === 'accept') {

                if(myRide.seat_available < seatsRequested) {
                  toast.show('Not enough seats available to accept this request.', {
                    type: 'danger',
                    duration: 4000,
                    offset: 30,
                    animationType: 'slide-in',
                  });
                  return;
                }

                response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/accept`, { 'requestId': req_id });

              } else {
                response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/reject/${req_id}`);
              }
              if (response.status === 200) {
                
                if(action === 'accept') {
                  console.log(myRide.seat_available);
                  setMyRide({ ...myRide, seats_available: myRide.seat_available - seatsRequested });
                }
          
                toast.show(successMessage, {
                  type: 'success',
                  duration: 4000,
                  offset: 30,
                  animationType: 'slide-in',
                });
                
                if (refreshRides) refreshRides();
              } else {

                throw new Error(response);
              }
            } catch (error) {
              console.log(error.response?.data);
              toast.show('Failed to process request. Please try again.', {
                type: 'danger',
                duration: 4000,
                offset: 30,
                animationType: 'slide-in',
              });
            }
          },
        },
      ],
      
    );
  };

  return (
    <LinearGradient
      colors={['#ff7f7f', '#ffa07a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.itemContainer, { width: width - 32 }]}
    >
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>{username}</Text>
        <Text style={styles.itemText}>{seatsRequested} Seats</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleRequestAction('accept')}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRequestAction('reject')}
        >
          <Ionicons name="close-circle" size={20} color="#fff" />
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const ManageRides = () => {
  const toast = useToast();
  const { myRide } = useGlobalContext();
  const [requests, setRequests] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loadingR, setLoadingR] = useState(false);
  const [loadingP, setLoadingP] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = useCallback(async () => {

    setLoadingR(true);
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/${myRide.ride_id}`);
      if (response.status === 200) {

        setRequests(response.data.message);
      } else {
        throw new Error(response);
      }
    } catch (error) {

      console.log(error.response);
      if (error.response?.data?.message === "No ride requests found") {
        setRequests([]);
      } else {

        toast.show('Error fetching your requests, please try again later.', {
          type: 'danger',
          duration: 4000,
          offset: 30,
          animationType: 'slide-in',
        });
      }
    } finally {

      setLoadingR(false);
    }
  }, [myRide, toast]);

  const fetchPassengers = useCallback(async () => {

    setLoadingP(true);
    try {

      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/user/passenger/${myRide.ride_id}`);
      if (response.status === 200) {

        setPassengers(response.data.data[1]);
      } else {

        throw new Error(response);
      }
    } catch (error) {
      console.log(error.response);
      if (error.response?.data?.message === "No passengers found") {

        setPassengers([]);
      } else {

        toast.show(error.response?.data?.message, {

          type: 'danger',
          duration: 4000,
          offset: 30,
          animationType: 'slide-in',
        });
      }
    } finally {

      setLoadingP(false);
    }
  }, [myRide, toast]);

  useEffect(() => {

    if (!myRide) {

      router.replace('/published-ride');
    } else {

      fetchRequests();
      fetchPassengers();  
    }
  }, [myRide, fetchRequests, fetchPassengers]);

  useEffect(() => {

  }, [myRide.seats_available]);

  const handleRefresh = useCallback(() => {

    setRefreshing(true);
    fetchRequests().then(() => fetchPassengers()).finally(() => setRefreshing(false));
  }, [fetchRequests, fetchPassengers]);

  const completeRide = async () => {
      
      Alert.alert(
        "Complete Ride",
        "Are you sure you want to complete this ride?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Complete",
            style: "destructive",
            onPress: async () => {
              try {

                await setAuthHeaders(axios);
                const response = await axios.put(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/complete`, { 'ride_id': myRide.ride_id });
  
                if (response.status === 200) {

                  toast.show('Ride completed successfully.', {
                    type: "success",
                    duration: 4000,
                    offset: 30,
                    animationType: "slide-in",
                  });
                  router.replace('/publish-ride');
                } else {

                  throw new Error(response);
                }
              } catch (error) {

                console.log("1",error.response);

                toast.show(error.response.data.message, {
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
    }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ff6347', '#ff7f50']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.replace('/publish-ride')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Ride</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Pending Requests</Text>
        {loadingR ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6347" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : (
          <FlashList
            estimatedItemSize={100}
            data={requests}
            keyExtractor={(item) => item.request_id}
            renderItem={({ item }) => (
              <RequestItem
                username={item.username}
                seatsRequested={item.seats_requested}
                req_id={item.request_id}
                refreshRides={fetchPassengers}
              />
            )}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={() => (<Text style={styles.emptyText}>No pending requests for this ride</Text>)}
          />
        )}

        <Text style={styles.sectionTitle}>Ride Passengers</Text>
        {loadingP ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6347" />
            <Text style={styles.loadingText}>Loading Passengers...</Text>
          </View>
        ) : (
          <FlashList
            estimatedItemSize={100}
            data={passengers}
            keyExtractor={(item) => item.passenger_ride_id}
            renderItem={({ item }) => (
              <PassengerItem
                username={item.username}
                seats={item.seats_occupied}
                phone={item.phone}
                fare={item.fare}
                passenger_id={item.passenger_id}
                ride_id={item.ride_id}
                refreshPassenger={fetchPassengers}
              />
            )}
            ListEmptyComponent={() => (<Text style={styles.emptyText}>No passengers for this ride</Text>)}
          />
        )}
      
      <TouchableOpacity style={styles.requestButton} onPress={completeRide}>
        <Text style={styles.requestButtonText}>Complete Ride</Text>
      </TouchableOpacity>

      </View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  itemContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  acceptButton: {
    backgroundColor: '#2ecc71',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  actionText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  requestButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#ff6347",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  requestButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#fff",
  },
});

export default ManageRides;
