import { Stack } from "expo-router";
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { StatusBar } from "expo-status-bar";

const AuthLayout = () => {
    return (
        <>
            <Stack>
                <Stack.Screen 
                    name="sign-up"
                    options={{ headerShown: false }} />
                <Stack.Screen 
                    name="sign-in"
                    options={{ headerShown: false }} />
            </Stack>

            <StatusBar backgroundColor='#FFF' style='dark'/>
        </>
    );
};

export default AuthLayout;
