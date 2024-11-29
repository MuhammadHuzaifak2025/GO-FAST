import { View, Text, Image } from "react-native";
import { Tabs, Redirect } from "expo-router";

import { icons } from "../../constants";
import { Colors } from "../../constants/Colors";

const TabIcon = ({ icon, color, name, focused }) => {
    return (
        <View
            style={{
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 5,
                flexDirection: "column",
                width: 50,
            }}
        >
            <Image
                source={icon}
                resizeMode="contain"
                tintColor={color}
                style={{
                    marginTop: 20,
                    width: 25,
                    height: 25,
                }}
            />
            <Text
                style={[
                    {
                        color: color,
                    },
                    { fontFamily: focused ? "Poppins-SemiBold" : "Poppins-Regular" },
                    { fontSize: 10 },
                ]}
            >
                {name}
            </Text>
        </View>
    );
};

const TabsLayout = () => {
    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarHideOnKeyboard: true,
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: Colors.light.primary,
                    tabBarInactiveTintColor: "#CDCDE0",
                    tabBarStyle: {
                        height: 60, // Standard tab bar height
                        borderTopColor: "transparent",
                        paddingHorizontal: 5,
                        paddingVertical: 0, // Add vertical padding to center items
                        alignItems: "center", // Centers the tabs
                    },
                }}
            >
                <Tabs.Screen
                    name="your-requests"
                    options={{
                        title: "Your Requests",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.rides}
                                color={color}
                                name="Your Ride"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="(ride)"
                    options={{
                        title: "Find Ride",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.search}
                                color={color}
                                name="Find Ride"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="(manage)"
                    options={{
                        title: "Publish",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.add}
                                color={color}
                                name="Publish"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="(Chat)"
                    options={{
                        title: "Inbox",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.chat}
                                color={color}
                                name="Inbox"
                                focused={focused}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.profile}
                                color={color}
                                name="Profile"
                                focused={focused}
                            />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
};

export default TabsLayout;
