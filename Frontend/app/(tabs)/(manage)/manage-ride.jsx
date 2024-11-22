import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../../context/GlobalProvider';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { setAuthHeaders } from '../../../utils/expo-store';
import { useToast } from 'react-native-toast-notifications';

const RequestItem = ({
  username,
  seatsRequested,
  req_id,
  refreshRides,
}) => {
  const toast = useToast();

  const handleRequestAction = async (action) => {
    const confirmText =
      action === 'accept' ? 'Accept this request?' : 'Reject this request?';
    const successMessage =
      action === 'accept'
        ? 'Request accepted successfully.'
        : 'Request rejected successfully.';

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

              if(action === 'accept'){

                response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/accept`, {'requestId': req_id});
              }
              else{

                response = await axios.delete(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/reject/${req_id}`);
              }

              if (response.status === 200) {

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

              console.log(error.response.data);
              toast.show('Failed to process request. Please try again.', {
                type: 'danger',
                duration: 4000,
                offset: 30,
                animationType: 'slide-in',
              });
            }
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
        colors={['#ff7f7f', '#ffa07a']} // Light red to salmon
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.requestItem}
    >

      <View style={styles.requestDetails}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.seatsRequested}>{seatsRequested} Seats</Text>
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
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);

    try {
      await setAuthHeaders(axios);

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request/${myRide}`
      );

      console.log(response);

      if (response.status === 200) {
        setRequests(response.data.message);
        setLoading(false);
      } else {
        throw new Error(response);
      }
    } catch (error) {

      console.log(error.response);
      if(error.response.message === "No ride requests found"){
        setRequests([]);
      }
      else{

          toast.show('Error fetching your requests, please try again later.', {
              type: 'danger',
              duration: 4000,
              offset: 30,
              animationType: 'slide-in',
            });
        }

    }
    finally{

        setLoading(false);
    }
  };

  useEffect(() => {
    if (!myRide) {
      router.replace('/published-ride');
    } else {
      fetchRequests();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/publish-ride')}>
          <Ionicons name="arrow-back" size={28} color="#EC5F5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Requests</Text>
      </View>

      {loading ? (
        <View>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
            data={requests}
            keyExtractor={(item) => item.request_id}
            renderItem={({ item }) => (
            <RequestItem
                username={item.username}
                seatsRequested={item.seats_requested}
                req_id={item.request_id}
                refreshRides={fetchRequests}
            />
            )}
            refreshing={refreshing}
            onRefresh={() => {
                setRefreshing(true);
                fetchRequests();
                setRefreshing(false);
                }
            }
            contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  requestItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 3,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  seatsRequested: {
    fontSize: 16,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default ManageRides;
