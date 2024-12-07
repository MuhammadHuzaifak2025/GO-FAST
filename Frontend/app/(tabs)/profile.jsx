import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    FontAwesome5,
    MaterialCommunityIcons,
    Ionicons,
} from "@expo/vector-icons";
import axios from "axios";
import CustomButton from "../../components/CustomButton";
import { useToast } from "react-native-toast-notifications";
import { useGlobalContext } from "../../context/GlobalProvider";
import { resetSecureStore, setAuthHeaders } from "../../utils/expo-store";
import { router } from "expo-router";

import CarModal from "../../components/CarModal";
import RideHistory from "../../components/RideHistory";
import { Colors } from "../../constants/Colors.ts";

const Profile = () => {

    const { user, setUser, isAuthenticated, setIsAuthenticated } = useGlobalContext();
    const toast = useToast();

    const [stats, setStats] = useState({
        monthlyRides: 0,
        monthlyRidesDrive: 0,
        moneySpentMonth: 0,
        moneyEarnedMonth: 0,
    });

    const [isLogOut, setIsLogOut] = useState(false);

    const [registerCarDisplay, setRegisterCarDisplay] = useState(false);
    const [Ridehistory, setRideHistory] = useState(false);

    const handleswitch = () => {
        router.replace("/BusPool/dashboard");
    };

    const fetchMonthlyStats = async () => {
        try {

            await setAuthHeaders(axios);
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/stats/monthly_stats`,
            );
            // console.log(response);
            if(response.status === 200) {
                setStats(response.data.data);
            }
            else{
                throw new Error(response);
            }
        } catch (error) {
            // console.log(error);
        }
    };
    
    useEffect(() => {

        fetchMonthlyStats();

    }, []);

    const handleLogOut = async () => {
        setIsLogOut(true);
        try {
            await setAuthHeaders(axios);
            const response = await axios.post(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/user/logout`,
                {},
                { withCredentials: true },
            );
            if (response.status === 200) {
                setUser(null);
                setIsAuthenticated(false);
                toast.show("Successfully Logged Out", {
                    type: "success",
                    duration: 6000,
                    offset: 30,
                });
                await resetSecureStore(axios);
                router.replace("/");
            } else {
                throw new Error(response);
            }
        } catch (error) {
            console.log(error);
            toast.show(error?.response?.data?.message, {
                type: "danger",
                duration: 4000,
                offset: 30,
            });
        }
        setIsLogOut(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <CarModal
                    visible={registerCarDisplay}
                    onClose={() => setRegisterCarDisplay(false)}
                />
                <RideHistory
                    visible={Ridehistory}
                    user_id={user?.user_id}
                    onClose={() => {
                        setRideHistory(false);
                    }}
                />
                <Text style={styles.title}>Profile</Text>
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{user?.username}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                <Text style={styles.statsTitle}>Monthly Ride Stats</Text>
                <ScrollView style={styles.statsContainer}
                            contentContainerStyle={{flexDirection: "row",gap: 10}}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}>
                    
                    <View style={styles.statCard}>
                        <FontAwesome5 name="car" size={24} color={Colors.light.contrast} />
                        <Text style={styles.statLabel}>Rides</Text>
                        <Text style={styles.statLabel}>Ridden</Text>
                        <Text style={styles.statValue}>{stats?.total_rides_as_passenger }</Text>
                    </View>

                    <View style={styles.statCard}>
                        <MaterialCommunityIcons
                            name="steering"
                            size={24}
                            color={Colors.light.contrast}
                        />
                        <Text style={styles.statLabel}>Rides</Text>
                        <Text style={styles.statLabel}>Driven</Text>
                        <Text style={styles.statValue}>{stats?.this_month_rides_as_driver || 0 }</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="cash-outline"
                            size={24}
                            color={Colors.light.contrast}
                        />
                        <Text style={styles.statLabel}>Money</Text>
                        <Text style={styles.statLabel}>Spent</Text>
                        <Text style={styles.statValue}>{stats?.total_fare_as_passenger || 0} Rs</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Ionicons
                            name="cash-outline"
                            size={24}
                            color={Colors.light.contrast}
                        />
                        <Text style={styles.statLabel}>Money</Text> 
                        <Text style={styles.statLabel}>Earned</Text>
                        <Text style={styles.statValue}>{stats?.total_fare_as_driver || 0} Rs</Text>
                    </View>

                </ScrollView>

                <View style={styles.optionsContainer}>
                    <Text style={styles.optionsTitle}>Account Options</Text>
                    <CustomButton
                        textContent="Ride History"
                        handlePress={() => {
                            setRideHistory(true);
                        }}
                        containerStyles={styles.optionButton}
                    />
                    <CustomButton
                        textContent="Register Car"
                        handlePress={() => {
                            setRegisterCarDisplay(true);
                        }}
                        containerStyles={styles.optionButton}
                    />
                    <CustomButton
                        textContent="Sign Out"
                        handlePress={handleLogOut}
                        isLoading={isLogOut}
                        containerStyles={styles.optionButton}
                    />
                    <CustomButton
                        textContent="Switch Modes"
                        handlePress={handleswitch}
                        containerStyles={styles.optionButton}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollView: {
        alignItems: "center",
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: Colors.light.text,
        marginBottom: 20,
    },
    userInfo: {
        alignItems: "center",
        marginBottom: 20,
    },
    username: {
        fontSize: 22,
        fontWeight: "bold",
    },
    email: {
        fontSize: 16,
        color: "#666",
    },
    statsTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: Colors.light.text,
        marginVertical: 20,
        textAlign: "center",
    },
    statsContainer: {
        width: "90%",
        // flex:1,
        marginBottom: 20,

    },
    statCard: {
        flex: 1,
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.light.primary,
        elevation: 8, // Higher elevation for prominent shadow
        shadowColor: Colors.light.primary, // Glow color
        shadowOffset: { width: 0, height: 0 }, // Center the shadow for a glow effect
        shadowOpacity: 0.6, // Make the shadow slightly transparent
        shadowRadius: 10, // Increase radius for a softer glow
        padding: 15,
        backgroundColor: "white",
        borderRadius: 10,
        minWidth: 100,
        // width: "20%",
    },
    statLabel: {
        textAlign: "center",
        fontSize: 16,
        color: Colors.light.primary,
        marginTop: 5,
        textAlign: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.light.primary,
        marginTop: 5,
    },
    optionsContainer: {
        width: "90%",
    },
    optionsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: Colors.light.text,
        marginBottom: 10,
    },
    optionButton: {
        marginVertical: 10,
    },
    modalContainer: {
        backgroundColor: "white",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: "80%",
        width: "100%",
    },
});

export default Profile;
