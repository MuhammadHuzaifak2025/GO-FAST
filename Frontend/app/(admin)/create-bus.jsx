import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, StyleSheet, Alert, ToastAndroid } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import axios from 'axios'
import { setAuthHeaders } from '../../utils/expo-store'
import { MapPin, Plus, X } from 'lucide-react-native'
import { useToast } from "react-native-toast-notifications";
import { v4 as uuidv4 } from 'uuid';
import * as Location from 'expo-location';
// import { useRouter } from 'expo-router';

export default function BusManagement() {
    const [loading, setLoading] = useState(false);
    const [isloading, setIsLoading] = useState(false);
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
    const [location, setLocation] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords); // Set only the coordinates
        }

        getCurrentLocation();
    }, []);
    const [showSuggestions, setshowsuggestion] = useState(false);
    useEffect(() => {
        const fetchSuggestions = async () => {
            // alert("Ajdhsak")
            if (newRoute.length < 3) {
                setSuggestions([]); // Clear suggestions if address is too short
                return;
            }

            if (!location) {
                // console.error('Location not available for proximity');
                setLocation({ latitude: 24.8607, longitude: 67.0011 }); // Default to Karachi coordinates
                // return;
            }
            console.log(newRoute.length);

            setLoading(true);
            try {
                console.log(newRoute);

                const TEMPsessionToken = uuidv4();
                const { longitude, latitude } = location;
                console.log(encodeURIComponent(newRoute));
                const response = await axios.get(
                    `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(newRoute)}&access_token=${process.env.EXPO_PUBLIC_MAPBOXTOKEN}&session_token=${TEMPsessionToken}&language=en&country=PK&limit=10&types=country%2Cstreet%2Cpoi&poi_category=&proximity=${longitude}%2C${latitude}`
                );

                if (response.data && response.data.suggestions && response.data.suggestions.length > 0) {
                    console.log(response.data.suggestions[0]?.name);
                    setSuggestions(response.data.suggestions);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimeout = setTimeout(fetchSuggestions, 500); // Debounce API requests

        return () => clearTimeout(debounceTimeout); // Cleanup timeout
    }, [showSuggestions, newRoute]);

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
                        onChangeText={(e) => {
                            setNewRoute(e);
                            setshowsuggestion(true);
                        }}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addRoute}>
                        <Plus color="#007AFF" size={24} />
                    </TouchableOpacity>
                </View>
                {/* {loading && <Text>Loading...</Text>} */}
                {Array.isArray(suggestions) && suggestions.length > 0 && (
                    <ScrollView style={styles.suggestionsList}>
                        {suggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => setNewRoute(suggestion.full_address || suggestion.place_formatted || suggestion.name)}
                            >
                                <Text style={styles.suggestionText}>
                                    {suggestion.name || suggestion.place_formatted || suggestion.full_address}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

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
    suggestionsList: {

        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        maxHeight: 200,          // Limit height for scrollable list
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,            // Shadow for Android
        zIndex: 999,
        // flex: 1,
        // flexDirection: 'column'            // Ensure it stays on top
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    suggestionText: {
        fontSize: 16,
        color: '#333',
    },
})