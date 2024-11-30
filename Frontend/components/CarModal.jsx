import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    SafeAreaView,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "react-native-toast-notifications";

// Assuming these components are defined elsewhere in your project
import FormField from "./FormField";
import CustomButton from "./CustomButton";
import axios from "axios";
import { setAuthHeaders } from "../utils/expo-store";
import { FlashList } from "@shopify/flash-list";
import { Colors } from "../constants/Colors";

export default function CarModal({ visible, onClose }) {
    const toast = useToast();
    const [cars, setCars] = useState({});
    const [loading, setLoading] = useState(false);
    const [isDropdownOpenList, setIsDropdownOpenList] = useState(false);
    const [isDropdownOpenForm, setIsDropdownOpenForm] = useState(false);
    const [dropdownHeightList] = useState(new Animated.Value(0));
    const [dropdownHeightForm] = useState(new Animated.Value(0));

    const [form, setForm] = useState({
        type_of_car: "",
        make: "",
        model: "",
        registrationNumber: "",
        color: "",
        seats: 0,
    });

    useEffect(() => {
        if (visible) {
            fetchCars();
            toggleDropdown("list");
        } else {
            setIsDropdownOpenForm(false);
            setIsDropdownOpenList(false);
            dropdownHeightForm.setValue(0);
            dropdownHeightList.setValue(0);
        }
    }, [visible]);

    const fetchCars = async () => {
        setLoading(true);
        await setAuthHeaders(axios);
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/vehicles`,
            );
            // console.log(response.data.status);
            if (response.status === 200) {
                setCars(response.data.data[1]);
                setLoading(false);
            }
        } catch (error) {
            toast.show("Could not fetch cars, please try  again later", {
                type: "danger",
                duration: 3000,
            });
            setLoading(false);
        }
    };

    const toggleDropdown = (check) => {
        if (check === "form") {
            const toValue = isDropdownOpenForm ? 0 : 300; // Adjust this value based on your needs
            Animated.timing(dropdownHeightForm, {
                toValue,
                duration: 400,
                useNativeDriver: false,
            }).start();

            if (isDropdownOpenList) {
                toggleDropdown("list");
            }

            setIsDropdownOpenForm(!isDropdownOpenForm);
        } else {
            const toValue = isDropdownOpenList ? 0 : 300; // Adjust this value based on your needs

            Animated.timing(dropdownHeightList, {
                toValue,
                duration: 400,
                useNativeDriver: false,
            }).start();

            if (isDropdownOpenForm) {
                toggleDropdown("form");
            }

            setIsDropdownOpenList(!isDropdownOpenList);
        }
    };

    const handleAddCar = async () => {
        if (
            !form.make ||
            !form.model ||
            !form.registrationNumber ||
            !form.color ||
            !form.seats ||
            !form.type_of_car
        ){
            toast.show("Please fill all required fields", {
                type: "danger",
                duration: 3000,
            });
            return;
        }
        if( (form.seats < 1 || form.seats > 6) || (form.type_of_car === "Bike" && form.seats > 2) ){
            toast.show("Please enter a valid number of seats", {
                type: "danger",
                duration: 3000,
            });
            return;
        }

        try {
            await setAuthHeaders(axios);

            const resp = await axios.post(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/vehicle`,
                {
                    type_of_vehicle: form.type_of_car,
                    seats: form.seats,
                    registration_number: form.registrationNumber,
                    model: form.model,
                    make: form.make,
                    color: form.color,
                },
            );

            if (resp.status === 200) {
                toast.show("Car Added Successfully", {
                    type: "success",
                    duration: 3000,
                });
                fetchCars();
                toggleDropdown("list");
            }
        } catch (error) {
            console.log(error.response.data.message);
            toast.show("Error Adding Car", {
                type: "danger",
                duration: 3000,
            });
        }

        setForm({
            type_of_car: "",
            make: "",
            model: "",
            registrationNumber: "",
            color: "",
            otherDetails: "",
        });
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay} />
            <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <Text style={styles.title}>Your Cars</Text>

                <TouchableOpacity
                    onPress={() => toggleDropdown("list")}
                    style={styles.dropdownHeader}
                >
                    <Text style={styles.dropdownHeaderText}>
                        {isDropdownOpenList ? "Your Cars" : "Show Cars"}
                    </Text>
                    <Ionicons
                        name={isDropdownOpenList ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <Animated.View
                    style={[styles.dropdownContent, { height: dropdownHeightList }]}
                >
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: "center" }}>
                            <ActivityIndicator size="large" color="white" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    ) : (
                        <FlashList
                            estimatedItemSize={136}
                            data={cars}
                            keyExtractor={(item) => item.vehicle_id}
                            renderItem={({ item }) => (
                                <View style={styles.carItem}>
                                    <View style={styles.carItemSameLine}>
                                        <Text style={styles.carText}>
                                            {item.make} {item.model}
                                        </Text>
                                        <Text style={styles.carText}>
                                            Reg#: {item.registration_number}
                                        </Text>
                                    </View>
                                    <View style={styles.carItemSameLine}>
                                        <Text style={styles.carText}>Color: {item.color}</Text>
                                        <Text style={styles.carText}>Seats: {item.seats}</Text>
                                    </View>
                                </View>
                            )}
                            containerStyles={{marginBottom: 20}}
                        />
                    )}
                </Animated.View>

                <TouchableOpacity
                    onPress={() => toggleDropdown("form")}
                    style={styles.dropdownHeader}
                >
                    <Text style={styles.dropdownHeaderText}>
                        {isDropdownOpenForm ? "Add Car" : "Add Car"}
                    </Text>
                    <Ionicons
                        name={isDropdownOpenForm ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <Animated.View
                    style={[styles.dropdownContent, { height: dropdownHeightForm }]}
                >
                    
                    <ScrollView >
                        <FormField
                            placeholder="Make"
                            value={form.make}
                            handleChangeText={(e) => setForm({ ...form, make: e })}
                            secureTextEntry={false}
                            otherStyles={{ marginVertical: 5 }}
                        />
                        <FormField
                            placeholder="Model"
                            value={form.model}
                            handleChangeText={(e) => setForm({ ...form, model: e })}
                            secureTextEntry={false}
                            otherStyles={{ marginVertical: 5 }}
                        />

                        <View style={styles.picker}>
                            <Picker
                                selectedValue={form.type_of_car}
                                onValueChange={(e) => setForm({ ...form, type_of_car: e })}
                                mode="dropdown"
                                style={{ color: Colors.light.item,fontFamily: "Poppins-SemiBold", fontSize: 16, paddingLeft: 0}}
                            >
                                <Picker.Item label="Type Of Vehicle" value="" />
                               
                                <Picker.Item
                                    style={{fontFamily: "Poppins-SemiBold", fontSize: 16}}
                                    label={"Car"}
                                    value={"Car"}
                                    />
                                <Picker.Item
                                    style={{fontFamily: "Poppins-SemiBold", fontSize: 16}}
                                    label={"Bike"}
                                    value={"Bike"}
                                />
    
                            </Picker>
                        </View>
                        <FormField
                            placeholder="Registration Number"
                            value={form.registrationNumber}
                            handleChangeText={(e) =>
                                setForm({ ...form, registrationNumber: e })
                            }
                            secureTextEntry={false}
                            otherStyles={{ marginVertical: 5 }}
                        />
                        <FormField
                            placeholder="Color"
                            value={form.color}
                            handleChangeText={(e) => setForm({ ...form, color: e })}
                            secureTextEntry={false}
                            otherStyles={{ marginVertical: 5 }}
                        />
                        <FormField
                            placeholder="seats"
                            value={form.seats}
                            keyboardType="numeric"
                            handleChangeText={(e) => setForm({ ...form, seats: e })}
                            secureTextEntry={false}
                            otherStyles={{ marginVertical: 5 }}
                        />
                        <CustomButton
                            textContent="Add Car"
                            handlePress={handleAddCar}
                            containerStyles={styles.addButton}
                        />
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 30,
        padding: 20,
        backgroundColor: Colors.light.item,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 1,
    },
    picker: {
        textAlign: 'left',
        backgroundColor: "#ffffff", // Picker background is white
        color: "#333", // Darker text for better readability
        borderRadius: 10,
        marginVertical: 10,
        paddingHorizontal: 10,
        height: 50, // Increased height for better touch target
        borderWidth: 1,
        borderColor: Colors.light.contrast,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "white",
        marginTop: 20,
        marginBottom: 10,
    },
    dropdownHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: Colors.light.contrast,
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    dropdownHeaderText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    dropdownContent: {
        overflow: "hidden",
    },
    carItem: {
        backgroundColor: "#f0f0f0", // Light background color
        padding: 10,
        marginBottom: 10,
        borderRadius: 10, // Rounded corners
        elevation: 5, // Elevation shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    // carItem: {
    //     padding: 10,
    //     borderWidth: 1,
    //     borderColor: "#ccc",
    // },
    carItemSameLine: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    carText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    loadingText: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginTop: 10,
    },
    formContainer: {
        marginBottom: 20,
    },
    addButton: {
        marginTop: 10,
        backgroundColor: "#27ae60",
        borderRadius: 8,
        padding: 15,
    },
});
