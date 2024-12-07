import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Animated,
    ScrollView,
    ActivityIndicator,
    useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import FormField from "../../../components/FormField";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FlashList } from "@shopify/flash-list";
import { Picker } from "@react-native-picker/picker";
import { setAuthHeaders } from "../../../utils/expo-store";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import { router } from "expo-router";
import { useGlobalContext } from "../../../context/GlobalProvider";
import { Colors } from "../../../constants/Colors";

const RideItem = ({ from, to, time, username, seats, ride_item }) => {
    const { setRide } = useGlobalContext();
    const { width } = useWindowDimensions();

    const rideDate = new Date(time);
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

    const formatTime = `${hours}:${minutes} ${newformat}`;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
                setRide(ride_item);
                router.push("/ride-details");
            }}
            style={[styles.rideItemContainer, { width: width - 40 }]}
        >
            <View style={[styles.rideItem]}>
                <View style={styles.rideHeader}>
                    <FontAwesome
                        name="car"
                        size={24}
                        color={Colors.light.tabIconDefault}
                    />
                    <View style={styles.sameLine}>
                        <Text style={styles.usernameText}>{username}</Text>
                        <View style={styles.seatsContainer}>
                            {/* <Text style={styles.seatText}>Seats Available: </Text> */}
                            {Array.from({ length: seats }).map((_, index) => (
                                <MaterialIcons
                                    key={index}
                                    name="event-seat"
                                    size={20}
                                    color={Colors.light.tabIconDefault}
                                    style={styles.seatIcon}
                                />
                            ))}
                        </View>
                    </View>
                </View>
                <View style={styles.sameLine}>
                    <Text style={styles.rideText}>From: {from}</Text>
                    <Text style={styles.rideText}>To: {to}</Text>
                </View>
                <Text style={styles.rideTime}>
                    {weekday[rideDate.getDay()]}, {rideDate.getDate()}{" "}
                    {month[rideDate.getMonth()]} • {formatTime}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const FindRide = () => {
    const [filteredRides, setFilteredRides] = useState([]);
    const [preference, setPreference] = useState({
        seats: "",
        dateTime: "",
        pickup: "",
        dropoff: "",
    });
    const [showFilter, setShowFilter] = useState(false);
    const animationValue = useRef(new Animated.Value(0)).current;
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isDate, setIsDate] = useState(false);

    const [rides, setRides] = useState([]);
    const [pageCount, setPageCount] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [moreLoading, setMoreLoading] = useState(false);
    const [listEnd, setListEnd] = useState(false);
    const [pageLimit, setPageLimit] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const toast = useToast();
    const { height, width } = useWindowDimensions();

    const fetchRides = async () => {
        if (pageCount === 1) {
            setIsLoading(true);
            setRides([]);
        }
        else setMoreLoading(true);

        try {
            await setAuthHeaders(axios);
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/rides/${pageCount}/5`,
            );

            if (response.status === 200) {
                setPageLimit(response.data.message.totalPages);

                if (pageCount === 1) {
                    setRides(response.data.message.rides);
                    setFilteredRides(response.data.message.rides);
                } else {
                    const newRides = response.data.message.rides || [];
                    setRides((prevRides) => [...prevRides, ...newRides]);
                    setFilteredRides((prevFilteredRides) => [
                        ...prevFilteredRides,
                        ...newRides,
                    ]);
                }
            } else {
                throw new Error(response);
            }
        } catch (error) {
            // console.log(error.response);
            if (error.response.data.message === "No rides available") {
                setListEnd(true);
            } else {
                toast.show("Error fetching rides, please try again later", {
                    type: "danger",
                    duration: 4000,
                    offset: 30,
                    animationType: "slide-in",
                });
            }
        } finally {
            if (pageCount === 1) setIsLoading(false);
            else setMoreLoading(false);
        }
    };

    const toggleFilter = () => {
        Animated.timing(animationValue, {
            toValue: showFilter ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setShowFilter(!showFilter);
    };

    const animatedHeight = animationValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, height * 0.4],
    });

    const filterRides = () => {
        const filtered = rides.filter((ride) => {
            const rideSeats = ride.seat_available;
            const requestedSeats = parseInt(preference.seats, 10);

            return (
                (!requestedSeats || rideSeats >= requestedSeats) &&
                (!preference.dateTime || ride.start_time === preference.dateTime) &&
                (!preference.pickup ||
                    ride.routes[0].route_name
                        .toLowerCase()
                        .includes(preference.pickup.toLowerCase())) &&
                (!preference.dropoff ||
                    ride.routes[1].route_name
                        .toLowerCase()
                        .includes(preference.dropoff.toLowerCase()))
            );
        });
        setListEnd(filtered.length === 0);
        setFilteredRides(filtered);
    };

    const openDateTimePicker = () => {
        setIsDate(true);
        setShowDatePicker(true);
    };

    const onDateChange = (e, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (isDate) {
                setPreference({ ...preference, dateTime: selectedDate });
                setIsDate(false);
                setShowDatePicker(true);
            } else {
                const newDateTime = new Date(preference.dateTime);
                newDateTime.setHours(selectedDate.getHours());
                newDateTime.setMinutes(selectedDate.getMinutes());
                setPreference({
                    ...preference,
                    dateTime: newDateTime.toLocaleString(),
                });
            }
        }
    };

    const fetchMoreRides = () => {
        if (!listEnd && !moreLoading && !isLoading) {
            setPageCount((p) => p + 1);
        }
    };

    useEffect(() => {
        if (
            preference.seats ||
            preference.dateTime ||
            preference.pickup ||
            preference.dropoff
        )
            filterRides();
    }, [preference]);

    useEffect(() => {
        if (pageCount <= pageLimit) {
            fetchRides();
        }
    }, [pageCount]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Available Rides</Text>
                <TouchableOpacity onPress={toggleFilter} style={styles.filterIcon}>
                    <FontAwesome
                        name={showFilter ? "times" : "filter"}
                        size={24}
                        color={Colors.light.primary}
                    />
                </TouchableOpacity>
            </View>

            <Animated.View
                style={[styles.filterContainer, { height: animatedHeight }]}
            >
                <ScrollView>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={preference.seats}
                            onValueChange={(e) => setPreference({ ...preference, seats: e })}
                            mode="dropdown"
                        >
                            <Picker.Item label="Select Seats" value="0" />
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <Picker.Item
                                    key={num}
                                    label={num.toString()}
                                    value={num.toString()}
                                />
                            ))}
                        </Picker>
                    </View>

                    <TouchableOpacity
                        onPress={openDateTimePicker}
                        style={styles.dateTimeField}
                    >
                        <Ionicons name="calendar" size={24} color={Colors.light.contrast} />
                        <Text style={styles.dateTimeText}>
                            {preference.dateTime
                                ? preference.dateTime.toLocaleString()
                                : "Select Date and Time"}
                        </Text>
                        {preference.dateTime && (
                            <TouchableOpacity
                                onPress={() => setPreference({ ...preference, dateTime: "" })}
                                style={styles.cross}
                            >
                                <Ionicons
                                    name="close"
                                    size={24}
                                    color={Colors.light.contrast}
                                />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={preference.dateTime || new Date()}
                            mode={isDate ? "date" : "time"}
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                            maximumDate={new Date().setMonth(new Date().getMonth() + 1)}
                        />
                    )}

                    <FormField
                        placeholder="Preferred Pickup Location"
                        value={preference.pickup}
                        handleChangeText={(e) =>
                            setPreference({ ...preference, pickup: e })
                        }
                        otherStyles={styles.formField}
                    />
                    <FormField
                        placeholder="Preferred Dropoff Location"
                        value={preference.dropoff}
                        handleChangeText={(e) =>
                            setPreference({ ...preference, dropoff: e })
                        }
                        otherStyles={styles.formField}
                    />
                </ScrollView>
            </Animated.View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.light.contrast} />
                    <Text style={styles.loadingText}>Loading rides...</Text>
                </View>
            ) : (
                <FlashList
                    estimatedItemSize={192}
                    data={filteredRides}
                    keyExtractor={(item) => item.ride_id}
                    renderItem={({ item }) =>
                        item.isPassenger ? null : (
                            <RideItem
                                from={item.routes[0]?.route_name || "Unknown"}
                                to={item.routes[1]?.route_name || "Unknown"}
                                time={item.start_time || "Unknown time"}
                                ride_item={item}
                                seats={item.seat_available || 0}
                                username={item.username || "Unknown User"}
                            />
                        )
                    }
                    onEndReached={fetchMoreRides}
                    onEndReachedThreshold={0.1}
                    ListEmptyComponent={() => (
                        <Text style={styles.subheading}>
                            No rides available. Please try again later.
                        </Text>
                    )}
                    ListFooterComponent={() =>
                        moreLoading && (
                            <ActivityIndicator
                                size="large"
                                color={Colors.light.primary}
                                style={styles.moreLoading}
                            />
                        )
                    }
                    refreshing={refreshing}
                    onRefresh={() => {
                        // setRides([]);
                        setRefreshing(true);
                        setListEnd(false);
                        setPageCount(1);
                        setPreference({ seats: "", dateTime: "", pickup: "", dropoff: "" });
                        setRefreshing(false);
                    }}
                    removeClippedSubviews={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        // backgroundColor: '#fff',
        // borderBottomWidth: 1,
        // borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    filterIcon: {
        padding: 10,
    },
    sameLine: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        flexWrap: 'wrap',
    },
    filterContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderWidth: 0,
        borderColor: "#ff6347", // Tomato border for the filter container
        borderRadius: 12,
        padding: 15,
        backgroundColor: "#f9f9f9", // Light background for the filter section
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    rideItemContainer: {
        flex: 1,
        marginVertical: 10,
        alignSelf: "center",
    },
    rideItem: {
        backgroundColor: "white",
        // borderWidth: 1,
        // borderColor: Colors.light.primary,
        padding: 20,
        borderRadius: 12,
        elevation: 8, // Higher elevation for prominent shadow
        shadowColor: Colors.light.primary, // Glow color
        shadowOffset: { width: 0, height: 0 }, // Center the shadow for a glow effect
        shadowOpacity: 0.6, // Make the shadow slightly transparent
        shadowRadius: 10, // Increase radius for a softer glow
    },
    rideHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    usernameText: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.light.contrast,
    },
    rideText: {
        fontSize: 16,
        color: Colors.light.contrast,
        marginTop: 5,
    },
    rideTime: {
        fontSize: 14,
        color: Colors.light.primary,
        // marginTop: 10,
        fontWeight: "bold",
    },
    dateTimeField: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderColor: "#e0e0e0",
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 10,
        backgroundColor: "#fff",
    },
    dateTimeText: {
        fontSize: 16,
        color: "#333",
        flex: 1,
        marginLeft: 10,
    },
    seatsContainer: {
        flexDirection: "row",
        alignItems: "center",
        // marginTop: 10,
    },
    seatIcon: {
        // marginRight: 4,
    },
    cross: {
        padding: 5,
    },
    picker: {
        borderColor: "#e0e0e0",
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 10,
        backgroundColor: "#fff",
    },
    seatText: {
        color: "#fff",
        fontSize: 14,
        // marginRight: 5,
    },
    subheading: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
    moreLoading: {
        marginVertical: 20,
    },
    formField: {
        marginVertical: 10,
    },
});

export default FindRide;
