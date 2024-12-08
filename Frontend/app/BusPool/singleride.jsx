import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { Toast, useToast } from 'react-native-toast-notifications';
import { process } from "../../constants";
// import axios from 'axios';

const { width } = Dimensions.get('window');

const busRegistration = () => {
    const { user } = useGlobalContext();
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [registrationopen, setRegistrationopen] = useState(false);
    const [ridedate, setRidedate] = useState(false);
    const [registeredinsem, setRegisteredinsem] = useState(false);
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
    const toast = useToast();
    const fetchBuses = async () => {
        try {
            await setAuthHeaders(axios);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/singleridepassenger/show`, {
                withCredentials: true,
            });
            setBuses(response.data.data[0].busses);
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
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/singleridepassenger/myrides`, {
                withCredentials: true,
            });
            console.log(response.status);
            if (response.status === 202) {
                setRegisteredinsem(true);
            }
            else if (response.data.data) {
                console.log(response.data.data);
                setData(response.data.data);
                setAlreadyRegistered(true);
            }
            setLoading(true);
        } catch (error) {
            console.log(error.response.data.message);
            setLoading(true);
            setAlreadyRegistered(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchuserstatus();
            console.log(registeredinsem)
            if (!registeredinsem) {
                if (!alreadyRegistered) {
                    console.log('fetching buses');
                    fetchBuses();
                }
            }
        }, [])
    );

    const openModal = (bus) => {
        setSelectedBus(bus);
        setModalVisible(true);
    };

    const handleSave = async () => {
        // console.log(pickupRoute, dropoffRoute, selectedBus.semester.semester_id, user.user_id, selectedBus.bus[0].bus_id);
        if (!startDate) {
            Alert.alert('Error', 'Please select a ride date');
            return;
        }
        // return;
        try {
            // console.log(pickupRoute, dropoffRoute);
            // return;
            await setAuthHeaders(axios);
            const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/singleridepassenger`, {
                "ride_date": startDate,
                "bus_id": selectedBus.bus_id
            }, { withCredentials: true });
            if (resp) {
                console.log(resp.data);
                Alert.alert('Success', 'Student registered successfully');
            }
        } catch (error) {
            console.log(error.response.data.message);
            setModalVisible(false);
            //    Toast.show('danger', error.response.data.message);
            toast.show(error.response.data.message, { type: "danger", duration: 6000, offset: 30 });

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
    if (registeredinsem) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.sectionTitle}>Already Registered in Semester</Text>
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
                                    <Text style={styles.busNumber}>Bus {item.bus_number}</Text>
                                </View>
                                <View style={styles.busDetails}>
                                    <Text style={styles.busInfo}>Seats: {item.seats}</Text>
                                    <Text style={styles.busInfo}>Fare: ${item.single_ride_fair}</Text>
                                </View>
                                <View style={styles.dueDateContainer}>
                                    <Clock color="#FF9800" size={16} />
                                    <Text style={styles.dueDateText}>Validaty only One Day</Text>
                                    {/* <Text style={styles.dueDateText}>Due: {getDaysLeft(item.due_date)} Days Left</Text> */}
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.bus_id.toString()}
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
                                        {renderInfoItem(<MapPin color="#F44336" size={24} />, "Fare", `$${selectedBus.single_ride_fair}`, "#F44336")}
                                        {/* <Text style={styles.label}>Select Ride Date</Text> */}
                                        <TouchableOpacity
                                            style={styles.datePicker}
                                            onPress={() => { setRidedate(true); setStartDate(null) }}
                                        >
                                            <Text style={styles.label}>
                                                {startDate ? ("Ride Date: " + startDate.toLocaleDateString()) : "Select Ride Date"}
                                            </Text>
                                        </TouchableOpacity>
                                        {ridedate && (
                                            <DateTimePicker

                                                value={new Date()}
                                                minimumDate={new Date()}
                                                mode="date"
                                                display="default"
                                                onChange={(event, selectedDate) => {
                                                    setRidedate(false);
                                                    if (selectedDate.getDay() === 6 || selectedDate.getDay() === 0) {
                                                        toast.show('Ride Date should be on Weekdays', { type: "danger", duration: 6000, offset: 30 });
                                                        return;
                                                    }
                                                    console.log(selectedDate.getDay())
                                                    if (selectedDate) setStartDate(selectedDate);
                                                }}
                                            />
                                        )}
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
                                <Text style={styles2.infoText}>Bus ID: {data.bus_id}</Text>
                            </View>
                            <View style={styles2.infoRow}>
                                <Text style={styles2.infoText}>Seats Booked: {1}</Text>
                            </View>
                            <View style={styles2.infoRow}>
                                <Text style={styles2.infoText}>Organization: {data.organization_name}</Text>
                            </View>
                            {!data.is_paid ?
                                <View style={styles2.infoRow}>
                                    <Text style={styles2.infoText}>Bank Account Details: {data.bank_account_no}</Text>
                                </View> : null}
                        </View>

                        {/* <View style={styles2.section}>
                            <Text style={styles2.sectionTitle}>Route Information</Text>
                            <View style={styles2.infoRow}>
                                <MapPin color="#4CAF50" size={24} />
                                <Text style={styles2.infoText}>Pickup: {data.pickup[0].route_name} (ID: {data.pickup[0].route_id})</Text>
                            </View>
                            <View style={styles2.infoRow}>
                                <MapPin color="#F44336" size={24} />
                                <Text style={styles2.infoText}>Dropoff: {data.dropoff[0].route_name} (ID: {data.dropoff[0].route_id})</Text>
                            </View>
                        </View> */}

                        <View style={styles2.section}>
                            <Text style={styles2.sectionTitle}>Payment Details</Text>
                            <View style={styles2.infoRow}>
                                <DollarSign color="#4CAF50" size={24} />
                                <Text style={styles2.infoText}>Single Ride Fare: ${data.single_ride_fair}</Text>
                                {/* <Text style={styles2.infoText}>Amount: ${data.amount}</Text> */}
                            </View>
                            {/* <View style={styles2.infoRow}>
                            </View> */}
                            <View style={styles2.infoRow}>
                                <Text style={styles2.infoText}>Payment Status: {data.is_paid ? 'Paid' : 'Unpaid'}</Text>
                            </View>
                        </View>

                        <View style={styles2.section}>
                            <Text style={styles2.sectionTitle}>Additional Information</Text>
                            <View style={styles2.infoRow}>
                                <Calendar color="#1A237E" size={24} />
                                {/* <Text style={styles2.infoText}>Semester ID: {data.semester_id}</Text> */}
                                <Text style={styles2.infoText}>Passenger Name: {user?.username}</Text>
                            </View>
                            <View style={styles2.infoRow}>
                                <Text style={styles2.infoText}>Ride Date: {formatDate(data.ride_date)}</Text>
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
    datePicker: {
        backgroundColor: "#fff",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 15,
    },
    dateText: {
        fontSize: 14,
        color: "#666",
    },
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

