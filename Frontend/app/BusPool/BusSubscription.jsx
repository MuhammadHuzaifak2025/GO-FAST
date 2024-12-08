import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Bus, X, User, CreditCard, Calendar, UserCheck, Clock, XCircle, CheckCircle, DollarSign } from 'lucide-react-native';
import axios from 'axios';
import { setAuthHeaders } from '../../utils/expo-store';
import { useGlobalContext } from '../../context/GlobalProvider';
import { process } from "../../constants";
// import axios from 'axios';

const { width } = Dimensions.get('window');

const busRegistration = () => {
  const { user } = useGlobalContext();
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pickupRoute, setPickupRoute] = useState(null);
  const [dropoffRoute, setDropoffRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registrationopen, setRegistrationopen] = useState(false);
  const [data, setData] = useState({
    // semester_passenger_id: 0,
    semester_passenger_id: 0,
    semester_id: 0,
    passenger_id: 0,
    pickup: [],
    dropoff: [],
    is_paid: false,
    amount: 0,
    bus_id: 0,
    bus_number: '',
    seats: 0,
    bus_organization: '',
    single_ride_fair: 0,
  });

  const fetchBuses = async () => {
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration/open`, {
        withCredentials: true,
      });
      setBuses(response.data.data);
      setRegistrationopen(true);
      setLoading(true);
    } catch (error) {
      setLoading(true);
      setRegistrationopen(false);
    }
  };

  const fetchuserstatus = async () => {
    try {
      await setAuthHeaders(axios);
      const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration/passenger`, {
        withCredentials: true,
      });
      console.log(response.data);
      if (response.data.data) {
        setData(response.data.data);
        console.log(data.dropoff);
        setAlreadyRegistered(true);
      }
      setLoading(true);
    } catch (error) {
      setLoading(true);
      setAlreadyRegistered(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchuserstatus();
      if (!alreadyRegistered)
        fetchBuses();
    }, [])
  );

  const openModal = (bus) => {
    setSelectedBus(bus);
    setPickupRoute(null);
    setDropoffRoute(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    console.log(pickupRoute, dropoffRoute, selectedBus.semester.semester_id, user.user_id, selectedBus.bus[0].bus_id);
    if (!pickupRoute || !dropoffRoute) {
      Alert.alert('Error', 'Please select both pickup and dropoff routes');
      return;
    }
    // return;
    try {
      // console.log(pickupRoute, dropoffRoute);
      // return;
      await setAuthHeaders(axios);
      const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/semester-passenger`, {
        "semester_id": selectedBus.semester.semester_id,
        "passenger_id": user.user_id,
        "pickup": pickupRoute,
        "dropoff": dropoffRoute,
        "bus_id": selectedBus.bus[0].bus_id,
      }, { withCredentials: true });
      if (resp) {
        console.log(resp.data);
        Alert.alert('Success', 'Student registered successfully');
        setModalVisible(false);
        fetchuserstatus();
      }
    } catch (error) {
      console.error(error.response);
      Alert.alert('Error', 'Failed to save registration');
    }
    // Alert.alert('Success', 'Student registered successfully');
    // setModalVisible(false);
  };

  const renderRouteDropdown = (label, selectedRoute, setSelectedRoute) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {selectedBus?.bus?.[0]?.routes?.map((route) => (
          <TouchableOpacity
            key={route.BusRoutes_id}
            style={[
              styles.routeButton,
              selectedRoute === route.route_id && styles.selectedRouteButton,
            ]}
            onPress={() => setSelectedRoute(route.route_id)}
          >
            <Text style={[
              styles.routeText,
              selectedRoute === route.route_id && styles.selectedRouteText,
            ]}>{route.route_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  const getDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };


  const renderInfoItem = (icon, label, value, color) => (
    <View style={styles.infoItem}>
      {icon}
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color }]}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
  if (!loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* return <Text style={styles.sectionTitle}>No Open Registrations</Text> */}
        <Text style={styles.label}>Loading...</Text>
      </SafeAreaView>)
  }
  if (!registrationopen) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.sectionTitle}>No Open Registrations</Text>
      </SafeAreaView>)
  }
  return (
    <>
      {!alreadyRegistered ? (
        <SafeAreaView style={styles.container}>
          <Text style={styles.sectionTitle}>Bus Registrations</Text>
          <FlatList
            data={buses}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.busItem} onPress={() => openModal(item)}>
                <View style={styles.busHeader}>
                  <View style={styles.busIconContainer}>
                    <Bus color="#007AFF" size={24} />
                  </View>
                  <Text style={styles.busNumber}>Bus {item.bus[0].bus_number}</Text>
                </View>
                <View style={styles.busDetails}>
                  <Text style={styles.busInfo}>Seats: {item.bus[0].seats}</Text>
                  <Text style={styles.busInfo}>Fare: ${item.bus[0].single_ride_fair}</Text>
                </View>
                <View style={styles.dueDateContainer}>
                  <Clock color="#FF9800" size={16} />
                  <Text style={styles.dueDateText}>Due: {getDaysLeft(item.due_date)} Days Left</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.registration_id.toString()}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <X color="#8E8E93" size={24} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Bus Registration</Text>
                {selectedBus && (

                  <ScrollView showsVerticalScrollIndicator={false}>
                    {renderInfoItem(<User color="#4CAF50" size={24} />, "Student Name", user?.username, "#4CAF50")}
                    {/* {renderInfoItem(<CreditCard color="#2196F3" size={24} />, "Student ID", user.user_id, "#2196F3")} */}

                    {renderInfoItem(<Calendar color="#FF9800" size={24} />, "Semester Details", (selectedBus.semester.type_semester + ' ' + selectedBus.semester.year), "#FF9800")}
                    {/* {renderInfoItem(<UserCheck color="#9C27B0" size={24} />, "Driver", "John Doe", "#9C27B0")} */}
                    {renderInfoItem(<MapPin color="#F44336" size={24} />, "Fare", `$${selectedBus.bus[0].single_ride_fair}`, "#F44336")}
                    <Text style={styles.label}>Click To Select Routes</Text>
                    {renderRouteDropdown('Pickup Route', pickupRoute, setPickupRoute)}
                    {renderRouteDropdown('Dropoff Route', dropoffRoute, setDropoffRoute)}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <Text style={styles.saveButtonText}>Save Registration</Text>
                    </TouchableOpacity>
                  </ScrollView>


                )}
              </View>
            </View>
          </Modal>
        </SafeAreaView>) :
        (<SafeAreaView style={styles2.container}>
          <ScrollView contentContainerStyle={styles2.scrollContent}>
            <View style={styles2.header}>
              <Text style={styles2.title}>Payment Status</Text>
              {data.is_paid ? (
                <CheckCircle color="#4CAF50" size={32} />
              ) : (
                <XCircle color="#F44336" size={32} />
              )}
            </View>

            <View style={styles2.section}>
              <Text style={styles2.sectionTitle}>Bus Information</Text>
              <View style={styles2.infoRow}>
                <Bus color="#1A237E" size={24} />
                <Text style={styles2.infoText}>Bus Number: {data.bus_number}</Text>
              </View>
              <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Seats Left: {data.seats}</Text>
              </View>
              <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Driver Details: Muhammad Ali - +92123456789</Text>
              </View>
            </View>

            <View style={styles2.section}>
              <Text style={styles2.sectionTitle}>Route Information</Text>
              <View style={styles2.infoRow}>
                <MapPin color="#4CAF50" size={24} />
                <Text style={styles2.infoText}>Pickup: {data.pickup[0].route_name}</Text>
              </View>
              <View style={styles2.infoRow}>
                <MapPin color="#F44336" size={24} />
                <Text style={styles2.infoText}>Dropoff: {data.dropoff[0].route_name}</Text>
              </View>
            </View>

            <View style={styles2.section}>
              <Text style={styles2.sectionTitle}>Payment Details</Text>
              <View style={styles2.infoRow}>
                <DollarSign color="#4CAF50" size={24} />
                <Text style={styles2.infoText}>45000 Rs</Text>
              </View>
              <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Single Ride Fare: {data.single_ride_fair} Rs</Text>
              </View>
              <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Payment Status: {data.is_paid ? 'Paid' : 'Unpaid'}</Text>
              </View>
            </View>

            <View style={styles2.section}>
              <Text style={styles2.sectionTitle}>Additional Information</Text>
              {/* <View style={styles2.infoRow}>
                <Calendar color="#1A237E" size={24} />
                <Text style={styles2.infoText}>Semester ID: {data.s}</Text>
              </View> */}
              <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Passenger Name: {user?.username}</Text>
              </View>
              {/* <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Semester Passenger ID: {data.semester_passenger_id}</Text>
              </View> */}
              <View style={styles2.infoRow}>
                <Text style={styles2.infoText}>Requested On: {formatDate(data.createdAt)}</Text>
              </View>
              {data.is_paid ?
                <View style={styles2.infoRow}>
                  <Text style={styles2.infoText}>Approved At: {formatDate(data.updatedAt)}</Text>
                </View> : null}
            </View>
          </ScrollView>
        </SafeAreaView>)
      }
    </>
  );
};

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1A237E',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  busItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  busHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  busIconContainer: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 12,
    marginRight: 16,
  },
  busNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A237E',
  },
  busDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  busInfo: {
    fontSize: 16,
    color: '#3A3A3C',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dueDateText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },

  modalView: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    width: width * 0.9,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1A237E',
    textAlign: 'center',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 8,
  },
  routeButton: {
    backgroundColor: '#E8F0FE',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  selectedRouteButton: {
    backgroundColor: '#1A237E',
  },
  routeText: {
    color: '#1A237E',
    fontWeight: '500',
  },
  selectedRouteText: {
    color: 'white',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  infoTextContainer: {
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1A237E',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default busRegistration;

