import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
// import { BlurView } from '@react-native-community/blur';
import FormField from './FormField';
import CustomButton from './CustomButton';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from 'react-native-toast-notifications';

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

const CarModal = ({ visible, onClose }) => {

    const toast = useToast();

    const [cars, setCars] = useState([]);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        make: '',
        model: '',
        registrationNumber: '',
        color: '',
        otherDetails: ''
    });

    useEffect(() => {
        if (visible) {
            fetchCars();
        }
    }, [visible]);

    const fetchCars = async () => {
        setLoading(true);
        try {
            // const response = await axios.get('${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/cars');
            setCars(testCars);
        } catch (error) {
            console.error("Error fetching cars:", error);
        }
        setLoading(false);
    };

    const handleAddCar = async () => {
        if (!form.make || !form.model || !form.registrationNumber || !form.color) {
            toast.show('Please fill all fields', {
              type: "danger",
              duration: 5000,
              offset: 30,
              animationType: "slide-in",
            });
            return;
        }
        try {
            // const response = await axios.post('${process.env.EXPO_PUBLIC_BACKEND_URL}/api/user/cars', form);
            // if (response.status === 201) {
            //     console.log("Car added successfully!");
            //     await fetchCars();
            //     setForm({ make: '', model: '', registrationNumber: '', color: '', otherDetails: '' });
            // }

            //temp\
            const newCar = {
                id: cars.length + 1,
                ...form,
            };
            
            setCars([...cars, newCar]);
            setForm({ make: '', model: '', registrationNumber: '', color: '', otherDetails: '' });
            toast.show("Car Added Successfully", {
                type: "success",
                duration: 5000,
                offset: 30,
                animationType: "slide-in",
              });
              
        } catch (error) {

            console.error("Error adding car:", error);
            toast.show(error.response.data.message, {
                type: "danger",
                duration: 4000,
                offset: 30,
                animationType: "slide-in",
              });

        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>

            <View style={styles.overlay} />

            <View style={styles.modalContainer}>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>

                <Text style={styles.title}>Your Cars</Text>
                
                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <FlatList
                        data={cars}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <LinearGradient style={styles.carItem}
                                            colors={['black', '#ff6347']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}>

                                <Text style={styles.carText}>{item.make} {item.model}</Text>
                                <Text style={styles.carText}>Reg#: {item.registrationNumber}</Text>
                                <Text style={styles.carText}>Color: {item.color}</Text>
                                <Text style={styles.carText}>{item.otherDetails}</Text>

                            </LinearGradient>
                        )}
                    />
                )}

                <Text style={styles.subtitle}>Add a New Car</Text>
                <ScrollView>
                    <FormField
                        placeholder="Make"
                        value={form.make}
                        handleChangeText = {(e) => setForm({...form, make: e})}
                        secureTextEntry={false}
                        />
                    <FormField
                        placeholder="Model"
                        value={form.model}
                        handleChangeText = {(e) => setForm({...form, model: e})}
                        secureTextEntry={false}
                        />
                    <FormField
                        placeholder="Registration Number"
                        value={form.registrationNumber}
                        handleChangeText = {(e) => setForm({...form, registrationNumber: e})}
                        secureTextEntry={false}
                        />
                    <FormField
                        placeholder="Color"
                        value={form.color}
                        handleChangeText = {(e) => setForm({...form, color: e})}
                        secureTextEntry={false}
                        />
                    <FormField
                        placeholder="Other Details"
                        value={form.otherDetails}
                        handleChangeText = {(e) => setForm({...form, otherDetails: e})}
                        secureTextEntry={false}
                        
                        />
                </ScrollView>
                <CustomButton textContent="Add Car" handlePress={handleAddCar} containerStyles={{marginTop:10}}/>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    absolute: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 60,
        padding: 20,
        backgroundColor: 'white',
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
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        marginTop: 10,
        marginBottom: 0,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    carItem: {
        padding: 10,
        backgroundColor: '#f2f2f2',
        marginVertical: 5,
        borderRadius: 10,
        
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Adjust opacity for a blur-like effect
    },
    carText: {
        fontSize: 16,
        color: '#fff',
        marginTop: 5,
      },
});

export default CarModal;