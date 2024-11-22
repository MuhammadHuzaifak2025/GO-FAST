import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from 'react-native-toast-notifications';
import { FlashList } from '@shopify/flash-list';
import axios from 'axios';
import { setAuthHeaders } from '../utils/expo-store';

const { width } = Dimensions.get('window');

export default function RideHistory({ visible, onClose, user_id }) {
    const toast = useToast();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchRides();
        } else {
            setRides([]);
        }
    }, [visible]);

    const fetchRides = async () => {
        setLoading(true);
        await setAuthHeaders(axios);
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/history`);
            if (response.status === 200) {
                const list = [...response.data.data[1].ride, ...response.data.data[1].ride_passenger];
                setRides(list);
            }
        } catch (error) {
            toast.show("Could not fetch ride history, please try again later", {
                type: "danger",
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        const ldate = new Date(date);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = ldate.toLocaleDateString('en-US', options);
        let hours = ldate.getHours();
        const minutes = ldate.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${formattedDate}, ${hours}:${minutes} ${ampm}`;
    };

    const RideCard = ({ item }) => (
        <LinearGradient
            style={styles.cardContainer}
            colors={['#4c669f', '#3b5998', '#192f6a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.rideId}>Ride #{item.ride_id}</Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.routeContainer}>
                    <Ionicons name="location" size={20} color="#fff" />
                    <View style={styles.routeTextContainer}>
                        <Text style={styles.routeText}>{item.routes[0].route_name}</Text>
                        <Ionicons name="arrow-down" size={16} color="#fff"  />
                        <Text style={styles.routeText}>{item.routes[1].route_name}</Text>
                    </View>
                </View>
                <View style={styles.fareContainer}>
                    <Text style={styles.fareLabel}>Fare</Text>
                    <Text style={styles.fareAmount}>${item.fare.toFixed(2)}</Text>
                </View>
            </View>
            {item.driver === user_id && (
                <View style={styles.driverTag}>
                    <Text style={styles.driverTagText}>You drove</Text>
                </View>
            )}
        </LinearGradient>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay} />
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.title}>Ride History</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading your rides...</Text>
                    </View>
                ) : rides.length > 0 ? (
                    <FlashList
                        estimatedItemSize={150}
                        data={rides}
                        keyExtractor={(item) => item.ride_id}
                        renderItem={({ item }) => <RideCard item={item} />}
                        contentContainerStyle={styles.listContainer}
                    />
                ) : (
                    <Text style={styles.noRidesText}>No rides found</Text>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContainer: {
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 30,
        padding: 20,
        backgroundColor: '#1a2a3a',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        marginTop: 10,
    },
    noRidesText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    listContainer: {
        paddingVertical: 10,
    },
    cardContainer: {
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    rideId: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    date: {
        color: '#ddd',
        fontSize: 14,
    },
    cardBody: {
        padding: 15,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    routeTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    routeText: {
        color: '#fff',
        fontSize: 16,
        alignItems: 'center',
        marginBottom: 5,
    },
    arrowIcon: {
        alignSelf: 'center',
        marginVertical: 5,
    },
    fareContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    fareLabel: {
        color: '#ddd',
        fontSize: 14,
    },
    fareAmount: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    driverTag: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#27ae60',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    driverTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
