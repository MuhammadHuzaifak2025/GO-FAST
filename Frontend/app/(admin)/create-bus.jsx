import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ToastAndroid } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { setAuthHeaders } from '../../utils/expo-store'
import { MapPin, Plus, X } from 'lucide-react-native'
import { useToast } from "react-native-toast-notifications";

export default function BusManagement() {
    const [newBus, setNewBus] = useState({
        bus_number: '',
        seats: '',
        single_ride_fair: '',
        routes: [],
    })
    const [newRoute, setNewRoute] = useState('')
    const toast = useToast();
    const addRoute = () => {
        if (newRoute.trim()) {
            setNewBus((prev) => ({
                ...prev,
                routes: [...prev.routes, newRoute.trim()],
            }))
            setNewRoute('')
        } else {
            Alert.alert('Error', 'Route cannot be empty')
        }
    }

    const removeRoute = (index) => {
        setNewBus((prev) => ({
            ...prev,
            routes: prev.routes.filter((_, i) => i !== index),
        }))
    }

    const handleInputChange = (name, value) => {
        setNewBus((prev) => ({
            ...prev,
            [name]: name === 'seats' || name === 'single_ride_fair' ? value.replace(/[^0-9]/g, '') : value,
        }))
    }

    const handleSubmit = async () => {
        try {
            if (!newBus.bus_number || !newBus.seats || !newBus.single_ride_fair || newBus.routes.length < 0) {
                toast.show('Please fill all fields', {
                    type: "danger",
                    duration: 5000,
                    offset: 30,
                    animationType: "slide-in",
                });
                setNewBus({
                    bus_number: '',
                    seats: '',
                    single_ride_fair: '',
                    routes: [],
                })
                return;
            }
            if (newBus.seats < 1 || newBus.single_ride_fair < 1) {
                toast.show('Seats and Single ride fair must be greater than 0', {
                    type: "danger",
                    duration: 5000,
                    offset: 30,
                    animationType: "slide-in",
                });
                setNewBus({
                    bus_number: '',
                    seats: '',
                    single_ride_fair: '',
                    routes: [],
                })
                return;
            }
            if (newBus.routes.length < 2) {
                toast.show('Please add at least 2 routes', {
                    type: "danger",
                    duration: 5000,
                    offset: 30,
                    animationType: "slide-in",
                });
                setNewBus({
                    bus_number: '',
                    seats: '',
                    single_ride_fair: '',
                    routes: [],
                })
                return;
            }
            // Error on Repeated Route
            let repeatedRoute = false;
            for (let i = 0; i < newBus.routes.length; i++) {
                for (let j = i + 1; j < newBus.routes.length; j++) {
                    if (newBus.routes[i] === newBus.routes[j]) {
                        repeatedRoute = true;
                        break;
                    }
                }
            }
            if (repeatedRoute) {
                toast.show('Routes cannot be repeated', {
                    type: "danger",
                    duration: 5000,
                    offset: 30,
                    animationType: "slide-in",
                });
                setNewBus({
                    bus_number: '',
                    seats: '',
                    single_ride_fair: '',
                    routes: [],
                })
                return;
            }
            if (newBus.seats > 100) {
                toast.show('Seats cannot be greater than 100', {
                    type: "danger",
                    duration: 5000,
                    offset: 30,
                    animationType: "slide-in",
                });
                setNewBus({
                    bus_number: '',
                    seats: '',
                    single_ride_fair: '',
                    routes: [],
                })
                return;
            }
            await setAuthHeaders(axios)
            const response = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/bus`, {
                ...newBus,
                seats: Number(newBus.seats),
                single_ride_fair: Number(newBus.single_ride_fair),
            }, {
                withCredentials: true,
            })
            if (response.status === 201) {
                try {
                    await setAuthHeaders(axios);
                    const routesWithCoordinates = newBus.routes.map((route) => ({
                        route_name: route, // Assuming `route` is a string
                        longitude: 0.0,
                        latitude: 0.0,
                    }));

                    const routeresp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/bus/routes`, {
                        "bus_id": response.data.message[0].bus_id,
                        "route": routesWithCoordinates,
                    }, {
                        withCredentials: true,
                    })
                    if (routeresp.status === 201) {
                        console.log(routeresp.data.message);
                        toast.show('Bus Created', {
                            type: "Success",
                            duration: 5000,
                            offset: 30,
                            animationType: "slide-in",
                        });
                        setNewBus({
                            bus_number: '',
                            seats: '',
                            single_ride_fair: '',
                            routes: [],
                        })
                    }

                } catch (error) {
                    setNewBus({
                        bus_number: '',
                        seats: '',
                        single_ride_fair: '',
                        routes: [],
                    })
                    console.log(error.response);
                    Alert.alert('Error', 'Failed to create routes')
                }

            }
        } catch (error) {
            console.log(error);
            Alert.alert('Error', 'Failed to create bus')
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Bus Management</Text>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Bus Number"
                    value={newBus.bus_number}
                    onChangeText={(value) => handleInputChange('bus_number', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Number of Seats"
                    value={newBus.seats}
                    onChangeText={(value) => handleInputChange('seats', value)}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Single Ride Fair"
                    value={newBus.single_ride_fair}
                    onChangeText={(value) => handleInputChange('single_ride_fair', value)}
                    keyboardType="numeric"
                />
                <View style={styles.routeInputContainer}>
                    <TextInput
                        style={styles.routeInput}
                        placeholder="Add a new route"
                        value={newRoute}
                        onChangeText={setNewRoute}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addRoute}>
                        <Plus color="#007AFF" size={24} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={newBus.routes}
                    renderItem={({ item, index }) => (
                        <View style={styles.routeItem}>
                            <MapPin color="#007AFF" size={16} style={styles.routeIcon} />
                            <Text style={styles.routeText}>{item}</Text>
                            <TouchableOpacity onPress={() => removeRoute(index)} style={styles.removeButton}>
                                <X color="#FF3B30" size={16} />
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item, index) => index?.toString()}
                    style={styles.routeList}
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Create Bus</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F2F2F7',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1C1C1E',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    input: {
        height: 50,
        borderColor: '#E5E5EA',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    routeInputContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    routeInput: {
        flex: 1,
        height: 50,
        borderColor: '#E5E5EA',
        borderWidth: 1,
        paddingHorizontal: 12,
        borderRadius: 8,
        fontSize: 16,
        marginRight: 8,
    },
    addButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E5E5EA',
    },
    routeList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    routeIcon: {
        marginRight: 8,
    },
    routeText: {
        flex: 1,
        fontSize: 16,
        color: '#1C1C1E',
    },
    removeButton: {
        padding: 4,
    },
    submitButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },
})