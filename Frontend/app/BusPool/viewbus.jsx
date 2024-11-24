import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Bus, Trash2 } from 'lucide-react-native';
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
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { setAuthHeaders } from '../../utils/expo-store';

const { width } = Dimensions.get('window');

const ViewBus = () => {
    const [buses, setBuses] = useState([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);



    const fetchBuses = async () => {
        try {
            await setAuthHeaders(axios);
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/bus/routes/all/`, {
                withCredentials: true,
            });
            setBuses(response.data.message);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch buses');
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBuses();
        }, [])
    );
    const openModal = (bus) => {
        setSelectedBus(bus);
        setModalVisible(true);
    };

    const renderBusItem = ({ item }) => (
        <TouchableOpacity style={styles.busItem} onPress={() => openModal(item)}>
            <View style={styles.busHeader}>
                <View style={styles.busIconContainer}>
                    <Bus color="#007AFF" size={24} />
                </View>
                <Text style={styles.busNumber}>Bus {item.bus.bus_number}</Text>
            </View>
            <View style={styles.busDetails}>
                <Text style={styles.busInfo}>Seats: {item.bus.seats}</Text>
                <Text style={styles.busInfo}>Fare: ${item.bus.single_ride_fair}</Text>
            </View>

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
            <Text style={styles.sectionTitle}>Bus Routes</Text>
            <FlatList
                data={buses}
                renderItem={renderBusItem}
                keyExtractor={(item) => item.bus.bus_id.toString()}
                style={styles.busList}
                contentContainerStyle={styles.busListContent}
            />
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
                                    <Text style={styles.closeButtonText}>×</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Bus Routes</Text>
                                {selectedBus && (
                                    <FlatList
                                        data={selectedBus.routes}
                                        renderItem={renderRouteItem}
                                        keyExtractor={(item, index) => index.toString()}
                                        contentContainerStyle={styles.routeList}
                                    />
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F2F2F7',
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1C1C1E',
    },
    busList: {
        flex: 1,
    },
    busListContent: {
        paddingBottom: 20,
    },
    busItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    busHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    busIconContainer: {
        backgroundColor: '#E5F1FF',
        borderRadius: 8,
        padding: 8,
        marginRight: 12,
    },
    busNumber: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    busDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    busInfo: {
        fontSize: 14,
        color: '#3A3A3C',
    },
    deleteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: width * 0.9,
        maxHeight: '80%',
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    closeButtonText: {
        fontSize: 28,
        color: '#8E8E93',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1C1C1E',
    },
    routeList: {
        width: '100%',
    },
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        width: '100%',
    },
    iconContainer: {
        marginRight: 12,
    },
    routeScroll: {
        flexGrow: 1,
    },
    routeName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3A3A3C',
        flexShrink: 1,
    },
});

export default ViewBus;

