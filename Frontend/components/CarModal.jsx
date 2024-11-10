import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Modal, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from 'react-native-toast-notifications';

// Assuming these components are defined elsewhere in your project
import FormField from './FormField';
import CustomButton from './CustomButton';
import axios from 'axios';
import { setAuthHeaders } from '../utils/expo-store';

const testCars = [
    {
        id: 1,
        make: 'Toyota',
        model: 'Camry',
        registrationNumber: 'ABC123',
        color: 'Blue',
        otherDetails: 'Hybrid, 2019 model',
    },
    {
        id: 2,
        make: 'Honda',
        model: 'Civic',
        registrationNumber: 'XYZ456',
        color: 'Red',
        otherDetails: 'Sedan, 2020 model',
    },
    {
        id: 3,
        make: 'Ford',
        model: 'F-150',
        registrationNumber: 'DEF789',
        color: 'Black',
        otherDetails: 'Truck, 2021 model',
    },
];

export default function CarModal({ visible, onClose }) {
    const toast = useToast();
    const [cars, setCars] = useState({});
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownHeight] = useState(new Animated.Value(0));

    const [form, setForm] = useState({
        type_of_car: '',
        make: '',
        model: '',
        registrationNumber: '',
        color: '',
        seats: 0
    });

    useEffect(() => {
        if (visible) {
            fetchCars();
        }
    }, [visible]);

    const fetchCars = async () => {
        setLoading(true);
        console.log("Hello")
        await setAuthHeaders(axios);
        try {
            console.log(process.env.EXPO_PUBLIC_BACKEND_URL)
            const response = await axios.get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/vehicles`);
            if (response)
                setTimeout(() => {
                    // console.log("hello")
                    // console.log(response)
                    setCars(response.data.data[1]);
                    console.log(cars)
                    setLoading(false);
                }, 1000);
        } catch (error) {
            setLoading(false);
            console.log(error)
        }
    };

    const toggleDropdown = () => {
        const toValue = isDropdownOpen ? 0 : 200; // Adjust this value based on your needs
        Animated.timing(dropdownHeight, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();
        fetchCars();
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleAddCar = () => {
        if (!form.make || !form.model || !form.registrationNumber || !form.color || !form.seats || !form.type_of_car) 
            toast.show('Please fill all required fields', {
                type: "danger",
                duration: 3000,
            });
            const addcar = async()=>{
                try {
                    await setAuthHeaders(axios);
                    const resp = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/vehicle`, {
                        "type_of_vehicle": form.type_of_car,
                        "seats": form.seats,
                        "registration_number": form.registrationNumber,
                        "model": form.model,
                        "make": form.make,
                        "color": form.color
                    })
                    console.log(resp);
                    if (resp) {
                        toast.show("Car Added Successfully", {
                            type: "success",
                            duration: 3000,
                        });
                    }
                } catch (error) {
                    console.log(error)
                    toast.show("Error Adding Car", {
                        type: "danger",
                        duration: 3000,
                    });
                }
            }
            addcar();
        

        // const newCar = {
        //     id: cars.length + 1,
        //     ...form,
        // };

        // setCars([...cars, newCar]);
        setForm({ make: '', model: '', registrationNumber: '', color: '', otherDetails: '' });
        toast.show("Car Added Successfully", {
            type: "success",
            duration: 3000,
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay} />
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.title}>Your Cars</Text>

                <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownHeader}>
                    <Text style={styles.dropdownHeaderText}>
                        {isDropdownOpen ? 'Add New Car' : 'Show Cars'}
                    </Text>
                    <Ionicons
                        name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <Animated.View style={[styles.dropdownContent, { height: dropdownHeight }]}>
                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : (
                        <FlatList
                            data={cars}
                            keyExtractor={(item) => item.vehicle_id}
                            renderItem={({ item }) => (
                                <LinearGradient
                                    style={styles.carItem}
                                    colors={['#4c669f', '#3b5998', '#192f6a']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.carText}>{item.make} {item.model}</Text>
                                    <Text style={styles.carText}>Reg#: {item.registration_number}</Text>
                                    <Text style={styles.carText}>Color: {item.color}</Text>
                                    <Text style={styles.carText}>Seats: {item.seats}</Text>
                                </LinearGradient>
                            )}
                        />
                    )}
                </Animated.View>

                <Text style={styles.subtitle}>Add a New Car</Text>
                <ScrollView style={styles.formContainer}>
                    <FormField
                        placeholder="Make"
                        value={form.make}
                        handleChangeText={(e) => setForm({ ...form, make: e })}
                        secureTextEntry={false}
                    />
                    <FormField
                        placeholder="Model"
                        value={form.model}
                        handleChangeText={(e) => setForm({ ...form, model: e })}
                        secureTextEntry={false}
                    />
                    <FormField
                        placeholder="Type Of Vehicle"
                        value={form.type_of_car}
                        handleChangeText={(e) => setForm({ ...form, type_of_car: e })}
                        secureTextEntry={false}
                    />
                    <FormField
                        placeholder="Registration Number"
                        value={form.registrationNumber}
                        handleChangeText={(e) => setForm({ ...form, registrationNumber: e })}
                        secureTextEntry={false}
                    />
                    <FormField
                        placeholder="Color"
                        value={form.color}
                        handleChangeText={(e) => setForm({ ...form, color: e })}
                        secureTextEntry={false}
                    />
                    <FormField
                        placeholder="seats"
                        value={form.seats}
                        handleChangeText={(e) => setForm({ ...form, seats: e })}
                        secureTextEntry={false}
                    />
                </ScrollView>
                <CustomButton
                    textContent="Add Car"
                    handlePress={handleAddCar}
                    containerStyles={styles.addButton}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 60,
        padding: 20,
        backgroundColor: '#2c3e50',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '600',
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#34495e',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    dropdownHeaderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    dropdownContent: {
        overflow: 'hidden',
    },
    carItem: {
        padding: 15,
        marginVertical: 5,
        borderRadius: 8,
    },
    carText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 5,
    },
    loadingText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    formContainer: {
        marginBottom: 20,
    },
    addButton: {
        marginTop: 10,
        backgroundColor: '#27ae60',
        borderRadius: 8,
        padding: 15,
    },
});