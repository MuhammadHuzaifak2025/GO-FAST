import { Stack } from "expo-router";
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const AuthLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack>
    );
};

export default AuthLayout;
