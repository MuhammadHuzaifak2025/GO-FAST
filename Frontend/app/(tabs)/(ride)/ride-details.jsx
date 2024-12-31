import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { setAuthHeaders } from "../../../utils/expo-store";
import axios from "axios";
import { useToast } from "react-native-toast-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Colors";
// import { process } from "../../../constants";

const RideDetailsScreen = () => {
    const [seatsRequested, setSeatsRequested] = useState(0);
    const [total, setTotal] = useState(0);

    const toast = useToast();
    const { ride } = useGlobalContext();
    const { width } = useWindowDimensions();

    const maxSeats = ride.seat_available;

    const rideDate = new Date(ride.start_time);
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    let hours = rideDate.getHours();
    let minutes = rideDate.getMinutes();
    const newformat = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    const time = `${hours}:${minutes} ${newformat}`;

    const sendRequest = async () => {
        try {
            await setAuthHeaders(axios);

            if (seatsRequested === 0) {
                toast.show("Please select seats required", {
                    type: "danger",
                    duration: 4000,
                    offset: 30,
                    animationType: "slide-in",
                });
                return;
            }

            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/ride/request`,
                { rideId: ride.ride_id, seats: seatsRequested },
            );

            if (response.status === 200) {
                toast.show("Request sent successfully", {
                    type: "success",
                    duration: 5000,
                    offset: 30,
                    animationType: "slide-in",
                });

                router.replace("/find-ride");
            } else {
                throw new Error(response);
            }
        } catch (error) {
            console.log(error.response);

            toast.show(error.response?.data?.message || "Error sending request", {
                type: "danger",
                duration: 4000,
                offset: 30,
                animationType: "slide-in",
            });

            router.replace("/find-ride");
        }
    };

    useEffect(() => {
        if (!ride) {
            router.replace("/find-ride");
        }
    }, []);

    useEffect(() => {
        setTotal(Math.floor(parseInt(ride.fare, 10) * seatsRequested));
    }, [seatsRequested]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.replace("/find-ride")}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={28}
                            color={Colors.light.contrast}
                        />
                    </TouchableOpacity>
                    <Text style={styles.driverName}>{ride.username}</Text>
                    <View style={styles.emptySpace} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.date}>
                        {weekday[rideDate.getDay()]}, {rideDate.getDate()}{" "}
                        {month[rideDate.getMonth()]}
                    </Text>

                    <View style={styles.timePriceRow}>
                        <View style={styles.timeContainer}>
                            <Text style={styles.label}>Leaving at:</Text>
                            <Text style={styles.timeHeader}>{time}</Text>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.label}>Price per seat:</Text>
                            <Text style={styles.priceHeader}>
                                Rs: {Math.floor(ride.fare)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tripDetails}>
                        <View style={styles.locationRow}>
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color={Colors.light.primary}
                            />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationTitle}>
                                    Starting: {ride.routes[0]?.route_name || "Unknown"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.locationRow}>
                            <MaterialIcons
                                name="flag"
                                size={24}
                                color={Colors.light.primary}
                            />
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationTitle}>
                                    Destination: {ride.routes[1]?.route_name || "Unknown"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.contactText}>Contact {ride.username}</Text>
          </TouchableOpacity> */}

                    <View style={styles.vehicleInfo}>
                        <Text style={styles.vehicleDetails}>
                            Seats available: {ride.seat_available}
                        </Text>
                        <Text style={styles.vehicleDetails}>
                            {ride.vehicle.make} {ride.vehicle.model}
                        </Text>
                        <Text style={styles.vehicleColor}>{ride.vehicle.color}</Text>
                    </View>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={seatsRequested}
                            onValueChange={(e) => setSeatsRequested(e)}
                            style={[styles.picker, { width: width - 32 }]}
                            mode="dropdown"
                        >
                            <Picker.Item label="Select seats required" value={0} />
                            {Array.from({ length: maxSeats }, (_, index) => index + 1).map(
                                (seat) => (
                                    <Picker.Item key={seat} label={`${seat}`} value={seat} />
                                ),
                            )}
                        </Picker>
                    </View>

                    <Text style={styles.fare}>
                        Total Fare: <Text style={styles.totalPrice}>Rs: {total}</Text>
                    </Text>
                </View>
            </ScrollView>

            <TouchableOpacity style={styles.requestButton} onPress={sendRequest}>
                <Text style={styles.requestButtonText}>Request for ride</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        // backgroundColor: "white",
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    driverName: {
        fontFamily: "Poppins-Bold",
        fontSize: 20,
        color: Colors.light.contrast,
        textAlign: "center",
        flex: 1,
    },
    emptySpace: {
        width: 44,
    },
    content: {
        padding: 16,
    },
    date: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        marginBottom: 16,
        color: "#333",
    },
    timePriceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    timeContainer: {
        alignItems: "flex-start",
    },
    priceContainer: {
        alignItems: "flex-end",
    },
    label: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
        color: "#666",
    },
    timeHeader: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: Colors.light.primary,
    },
    priceHeader: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: Colors.light.primary,
    },
    tripDetails: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    locationInfo: {
        marginLeft: 12,
        flex: 1,
    },
    locationTitle: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 14,
        color: "#333",
    },
    divider: {
        height: 1,
        backgroundColor: "#e0e0e0",
        marginVertical: 12,
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    contactText: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        color: Colors.light.primary,
        marginLeft: 8,
    },
    vehicleInfo: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    vehicleDetails: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#444",
        marginBottom: 4,
    },
    vehicleColor: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#888",
    },
    pickerContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    fare: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#333",
        textAlign: "center",
        marginBottom: 80,
    },
    totalPrice: {
        color: Colors.light.primary,
    },
    requestButton: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: Colors.light.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    requestButtonText: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#fff",
    },
});

export default RideDetailsScreen;
