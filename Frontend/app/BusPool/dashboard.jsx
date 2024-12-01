import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    Animated,
    Text,
    TouchableOpacity,
    StyleSheet,
    View,
    Image,
    Dimensions,
    SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { setAuthHeaders } from "../../utils/expo-store";
import { useGlobalContext } from "../../context/GlobalProvider";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 0.9;
import QRCode from "react-native-qrcode-svg";
import { Colors } from "../../constants/Colors";

const ProfileCard = () => {
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const [card_details, setCardDetails] = useState({});
    const { user } = useGlobalContext();
    const [loading, setLoading] = useState(false);
    const [noregistered, setNoRegistered] = useState(false);
    const fetchcarddetails = async () => {
        setLoading(true);
        try {
            await setAuthHeaders(axios);
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/gofast/api/busregistration/card`,
                {
                    withCredentials: true,
                },
            );
            setCardDetails(response.data.data);
            setNoRegistered(true);
            console.log(response.data.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setNoRegistered(false);
        }
    };
    const flipCard = () => {
        const toValue = isFlipped ? 0 : 180;

        Animated.timing(flipAnimation, {
            toValue,
            duration: 600,
            useNativeDriver: true,
        }).start(() => setIsFlipped(!isFlipped));
    };

    const frontInterpolate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ["0deg", "180deg"],
    });

    const backInterpolate = flipAnimation.interpolate({
        inputRange: [0, 180],
        outputRange: ["180deg", "360deg"],
    });

    const frontOpacity = flipAnimation.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });

    const backOpacity = flipAnimation.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    const profileData = {
        userPic: "https://via.placeholder.com/150",
        name: user?.username,
        phone: user?.phone,
        userId: user?.user_id,
        email: user?.email,
        validity: "",
    };
    useFocusEffect(
        useCallback(() => {
            fetchcarddetails();
        }, []),
    );
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };
    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (!noregistered)
        return <SafeAreaView style={styles.containerTEXT}>
            <Text style={styles.sectionTitleTEXT}>No Open Registrations</Text>
        </SafeAreaView>

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                onPress={flipCard}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Flip transportation card"
            >
                <View style={[styles.cardWrapper]}>
                    <Animated.View
                        style={[
                            styles.cardContainer,
                            { transform: [{ perspective: 1000 }] },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.card,
                                {
                                    opacity: frontOpacity,
                                    transform: [{ rotateY: frontInterpolate }],
                                },
                            ]}
                        >
                            <View style={styles.gradient}>
                                <View style={styles.cardContent}>
                                    <View>
                                        <View style={styles.header}>
                                            <Text style={styles.headerText}>
                                                {card_details?.organization_name} Transport
                                            </Text>
                                            <MaterialCommunityIcons
                                                name="bus"
                                                size={24}
                                                color={Colors.light.contrast}
                                            />
                                        </View>
                                        <Text style={styles.subHeader}>
                                            Student: {user?.username}
                                        </Text>
                                    </View>
                                    <View style={styles.detailsContainer}>
                                        <View style={styles.detailItem}>
                                            <MaterialCommunityIcons
                                                name="seat-passenger"
                                                size={20}
                                                color={Colors.light.contrast}
                                            />
                                            <Text style={styles.detailText}>
                                                Bus Id: {card_details?.bus_id}
                                            </Text>
                                        </View>
                                        <View style={styles.detailItem}>
                                            <MaterialCommunityIcons
                                                name="identifier"
                                                size={20}
                                                color={Colors.light.contrast}
                                            />
                                            <Text style={styles.detailText}>
                                                Bus Number: {card_details?.bus_number}
                                            </Text>
                                        </View>
                                        {card_details?.single_ride ? (
                                            <View style={styles.detailItem}>
                                                <MaterialCommunityIcons
                                                    name="calendar"
                                                    size={20}
                                                    color={Colors.light.contrast}
                                                />
                                                <Text style={styles.detailText}>
                                                    Created:{" "}
                                                    {new Date(
                                                        card_details?.ride_date,
                                                    ).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        ) : (
                                            <View style={styles.detailItem}>
                                                <MaterialCommunityIcons
                                                    name="calendar"
                                                    size={20}
                                                    color={Colors.light.contrast}
                                                />
                                                <Text style={styles.detailText}>
                                                    Validated for: {card_details?.type_semester}{" "}
                                                    {card_details?.year}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.slideText}>Slide to see QR code</Text>
                                </View>
                            </View>
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.card,
                                styles.cardBack,
                                {
                                    opacity: backOpacity,
                                    transform: [{ rotateY: backInterpolate }],
                                },
                            ]}
                        >
                            <View style={styles.backContent}>
                                <QRCode value={card_details?.qr} size={250} />
                                <Text style={styles.backText}>Scan for more details</Text>
                            </View>
                        </Animated.View>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        marginTop: 70,
        alignItems: "center",
    },
    // cardWrapper: {
    //     backgroundColor: "#fff",
    //     borderRadius: 12,
    //     padding: 16,
    //     marginBottom: 16,
    //     elevation: 2,
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.1,
    //     shadowRadius: 4,
    // },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
    },
    // card: {
    //     width: "100%",
    //     height: "100%",
    //     position: "absolute",
    //     backfaceVisibility: "hidden",
    // },
    // gradient: {
    //     flex: 1,
    //     padding: 20,
    // },
    // cardContent: {
    //     flex: 1,
    //     justifyContent: "space-between",
    // },
    // header: {
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    //     alignItems: "center",
    // },
    // headerText: {
    //     fontSize: 24,
    //     fontWeight: "bold",
    //     color: Colors.light.contrast,
    // },
    // SubHeader: {
    //     marginBottom: 20,
    //     fontSize: 20,
    //     fontWeight: "bold",
    //     color: Colors.light.contrast,
    // },
    // detailsContainer: {
    //     flex: 1,
    //     justifyContent: "center",
    // },
    // detailItem: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     marginBottom: 10,
    // },
    // detailText: {
    //     fontSize: 16,
    //     color: Colors.light.contrast,
    //     marginLeft: 10,
    // },
    // slideText: {
    //     fontSize: 14,
    //     color: Colors.light.contrast,
    //     textAlign: "center",
    //     marginTop: 10,
    // },
    // const styles = StyleSheet.create({
    containerTEXT: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "100%",
        height: "100%",
        position: "absolute",
        backfaceVisibility: "hidden",
    },
    cardWrapper: {
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
    gradient: {
        flex: 1,
        padding: 20,
        borderRadius: 12,
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 16,
        elevation: 6,
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flex: 1,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: Colors.light.contrast,
    },
    subHeader: {
        marginTop: 10,
        fontSize: 18,
        color: Colors.light.contrast,
    },
    detailsContainer: {
        flex: 1,
        justifyContent: "center",
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    detailText: {
        fontSize: 16,
        color: Colors.light.contrast,
        marginLeft: 10,
    },
    slideText: {
        fontSize: 14,
        color: Colors.light.contrast,
        textAlign: "center",
        marginTop: 10,
    },
    cardBack: {
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitleTEXT: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 24,
        color: '#1A237E',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    backContent: {
        padding: 20,
        alignItems: "center",
    },
    backText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#3949ab",
        marginTop: 10,
    },
});

export default ProfileCard;
