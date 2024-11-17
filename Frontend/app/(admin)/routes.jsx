import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react-native';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { setAuthHeaders } from '../../utils/expo-store';


const routes = () => {
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        fetchBuses();
    }, []);
    const fetchBuses = async () => {
        try {
            setAuthHeaders(axios);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/bus/routes/all`, {
                withCredentials: true,
            });
            setBuses(response.data.message);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch buses');
        }
    };
    const openModal = (bus) => {
        setSelectedBus(bus);
        setModalVisible(true);
    };
    const renderBusItem = ({ item }) => (
        <TouchableOpacity style={styles.busItem} onPress={() => openModal(item)}>
            <Text style={styles.busNumber}>Bus Number: {item.bus.bus_number}</Text>
            <Text>Seats: {item.bus.seats}</Text>
            <Text>Single Ride Fair: {item.bus.single_ride_fair}</Text>
        </TouchableOpacity>
    );
    const renderRouteItem = ({ item }) => (
        <View style={styles.routeItem}>
            <View style={styles.iconContainer}>
                <MapPin size={24} color="#007AFF" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.routeScroll}>
                <Text style={styles.routeName}>{item.route_name}</Text>
            </ScrollView>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.sectionTitle}>Existing Buses</Text>
            <FlatList data={buses} renderItem={renderBusItem} keyExtractor={(item) => item.bus.bus_id.toString()} style={styles.busList} />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.centeredView}>
                        <TouchableWithoutFeedback onPress={() => { }}>
                            <View style={styles.modalView}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>X</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Bus Routes</Text>
                                {selectedBus && (
                                    <FlatList
                                        data={selectedBus.routes}
                                        renderItem={renderRouteItem}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

        </SafeAreaView>
    )
}

export default routes

const styles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        right: 20,
        top: 10,
        zIndex: 1,
    },
    closeButtonText: {
        fontSize: 25,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },

    formContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    button: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },

    busList: {
        flex: 1,
    },
    busItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    busNumber: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    iconContainer: {
        marginRight: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,

    },
    closebutton: {
        // position: 'absolute',
        top: 10,
        // textAlign: 'right',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'flex-start', // Align items to the left
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        borderColor: '#e0e0e0',
        borderWidth: 1,
        width: '94%', // Ensure the item takes the full width
    },
    routeScroll: {
        flexGrow: 1, // Ensure the horizontal scroll container expands
    },
    routeName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        flexShrink: 1, // Prevent the text from overflowing
    },
})